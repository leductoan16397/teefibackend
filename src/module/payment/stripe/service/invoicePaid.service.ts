import { Injectable } from '@nestjs/common';
import { StripeEventAbstract } from '../abstract/stripeEvent.abstract';

import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { EnrollHistory } from 'src/module/database/schema/enrollHistory.schema';
import { Invoice } from 'src/module/database/schema/invoice.schema';
import { Kid } from 'src/module/database/schema/kid.schema';
import { Parent } from 'src/module/database/schema/parent.schema';
import { User } from 'src/module/database/schema/user.schema';
import { ENROLL_STATUS, INVOICE_STATUS, INVOICE_TYPE, MEMBER_TYPE } from 'src/common/constant';
import moment, { Moment } from 'moment';
import { Membership } from 'src/module/database/schema/membership.schema';
import { StripeGateway } from '../stripe.gateway';
import { EmailService } from 'src/module/email/email.service';
import { S3Service } from 'src/module/aws/s3.service';

@Injectable()
export class InvoicePaidService extends StripeEventAbstract {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Kid.name) private readonly kidModel: Model<Kid>,
    @InjectModel(Parent.name) private readonly parentModel: Model<Parent>,

    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<Invoice> & typeof Invoice,

    @InjectModel(Membership.name)
    private readonly membershipModel: Model<Membership>,

    @InjectModel(EnrollHistory.name)
    private readonly enrollHistoryModel: Model<EnrollHistory> & typeof EnrollHistory,

    private readonly stripeGateway: StripeGateway,
    private readonly emailService: EmailService,
    private readonly s3Service: S3Service,
  ) {
    super();
  }

  async process({ subscription, id, lines }) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const subscriptionId = subscription;
      const invoiceId = id;

      const enrollHistory = await this.enrollHistoryModel.findOne({
        stripeSubscriptionId: subscriptionId,
      });

      if (!enrollHistory) {
        throw new Error('no enroll history found');
      }

      const checkInvoice = await this.invoiceModel.findOne({
        partnerInvoiceId: invoiceId,
      });

      let invoiceAliasId = '';

      if (checkInvoice) {
        if (checkInvoice.type == INVOICE_TYPE.trial) {
          const student = await this.parentModel.findOne({ _id: checkInvoice.studentId }).lean();

          let studentName = student.name;

          const user = await this.userModel.findOne({ _id: student.userId }).lean();

          if (checkInvoice.childId) {
            const sd = await this.kidModel.findOne({ _id: checkInvoice.childId }).lean();
            studentName = sd.name;
          }

          invoiceAliasId = checkInvoice.aliasId;

          const resultUrl = await this.stripeGateway.generateInvoice({
            invoiceAliasId: invoiceAliasId,
          });

          await this.sendMailInvoice({
            invoice_pdf: resultUrl.url,
            id: invoiceAliasId,
            name: studentName,
            email: user.username,
            activeTime: moment.unix(lines.data[0].period.start).format('YYYY-MM-DD HH:mm:ss'),
            isTrial: 1,
            memberType: enrollHistory.memberType,
          });
        }

        throw new Error('already process');
      }

      const invoicePeriod = {
        start: moment.unix(lines.data[0].period.start).format('YYYY-MM-DD HH:mm:ss'),
        end: moment.unix(lines.data[0].period.end).format('YYYY-MM-DD HH:mm:ss'),
      };

      if (moment(enrollHistory.expireTime) >= moment(invoicePeriod.end)) {
        throw new Error('do nothing for past invoice');
      }

      const curInvoice = await this.invoiceModel.findOne({ _id: enrollHistory.invoiceId }).lean();

      const membership = await this.membershipModel
        .findOne({
          key: enrollHistory.memberType,
        })
        .lean();

      if (![MEMBER_TYPE.monthly, MEMBER_TYPE.yearly].includes(enrollHistory.memberType)) {
        throw new Error('only process for monthly or yearly membership');
      }

      const expireTime = await this.enrollHistoryModel.getMemberExpireTime({
        type: membership.key,
        membership,
        startTime: moment(enrollHistory.expireTime),
      });
      //add new invoice
      const aliasId = await this.invoiceModel.generatePaidAliasId();

      const recurInvoice = await new this.invoiceModel({
        aliasId: aliasId,
        provider: curInvoice.provider,
        paymentMethod: curInvoice.paymentMethod,
        title: `${membership.key} membership`,
        status: INVOICE_STATUS.success,
        amount: enrollHistory.totalPrice,
        currency: enrollHistory.currency,
        partnerTransactionId: curInvoice.partnerTransactionId,
        partnerInvoiceId: invoiceId,
        type: ENROLL_STATUS.paid,
        parentId: enrollHistory.parentId,
        kidId: enrollHistory.kidId,
        createdByUserType: 'system',
      }).save({ session });

      console.log('recurInvoice', recurInvoice);

      await this.enrollHistoryModel.findOneAndUpdate(
        {
          stripeSubscriptionId: subscriptionId,
        },
        {
          expireTime,
          invoiceId: recurInvoice._id,
          status: ENROLL_STATUS.paid,
          createdByUserType: 'system',
        },
        {
          session,
        },
      );

      const kidId = enrollHistory.kidId;

      const student = await this.parentModel.findOne({ _id: recurInvoice.parentId }).lean();

      let studentName = student.name;

      const user = await this.userModel.findOne({ _id: student.userId }).lean();
      if (kidId) {
        await this.kidModel.findOneAndUpdate(
          {
            _id: kidId,
          },
          {
            memberType: enrollHistory.memberType,
            createdBy: 'system',
          },
          {
            session: session,
          },
        );
        const sd = await this.kidModel.findOne({ _id: recurInvoice.childId }).lean();
        studentName = sd.name;
      } else {
        await this.parentModel.findOneAndUpdate(
          {
            _id: enrollHistory.parentId,
          },
          {
            memberType: enrollHistory.memberType,
            createdBy: 'system',
          },
          {
            session: session,
          },
        );
      }

      await session.commitTransaction();

      invoiceAliasId = recurInvoice.aliasId;

      const resultUrl = await this.stripeGateway.generateInvoice({
        invoiceAliasId: invoiceAliasId,
      });

      console.log('resultUrl', resultUrl);
      await this.sendMailInvoice({
        invoice_pdf: resultUrl.url,
        id: invoiceAliasId,
        name: studentName,
        email: user.username,
        activeTime: moment.unix(lines.data[0].period.start).format('YYYY-MM-DD HH:mm:ss'),
        isTrial: 0,
        memberType: enrollHistory.memberType,
      });
    } catch (ex) {
      console.log('ex', ex.message);
      await session.commitTransaction();
    } finally {
      await session.endSession();
    }
  }

  async sendMailInvoice(params: {
    invoice_pdf: string;
    id: string;
    isTrial: boolean | number;
    email: string;
    memberType: string;
    name: string;
    activeTime: string | Date | Moment;
  }) {
    const invoiceFile = params.invoice_pdf;
    const invoiceName = `${params.id}.pdf`;
    const invoiceUrl = `publics/invoices/${invoiceName}`;

    await this.s3Service.uploadFileUrlToS3(invoiceFile, invoiceUrl);

    this.emailService.sendPaymentInvoice({
      isTrial: params.isTrial,
      memberType: params.memberType,
      invoicePdf: invoiceUrl,
      invoiceName: invoiceName,
      name: params.name,
      activeTime: params.activeTime,
      email: params.email,
    });

    return true;
  }
}
