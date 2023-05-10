import { INVOICE_TYPE, MEMBER_TYPE } from 'src/common/constant';
import { GatewayAbstract } from '../abstract/gateway.abstract';
import { PriceStripeService } from './service/price.stripe.service';
import { SubscriptionStripeService } from './service/subscription.stripe.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvoiceStripeService } from './service/invoice.stripe.service';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { writeFileSync } from 'fs';
import { ensureDirPath } from 'src/common/utils';
import { generatePdf } from 'html-pdf-node';
import { S3Service } from 'src/module/aws/s3.service';
import { Constant } from 'src/module/database/schema/constant.schema';
import { EnrollHistory } from 'src/module/database/schema/enrollHistory.schema';
import { Invoice } from 'src/module/database/schema/invoice.schema';
import { Parent } from 'src/module/database/schema/parent.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StripeGateway extends GatewayAbstract {
  constructor(
    private readonly configService: ConfigService,
    private readonly priceStripeService: PriceStripeService,
    private readonly invoiceStripeService: InvoiceStripeService,
    private readonly subscriptionStripeService: SubscriptionStripeService,
    private readonly s3Service: S3Service,

    @InjectModel(Invoice.name) private readonly invoiceModel: Model<Invoice>,
    @InjectModel(Parent.name) private readonly parentModel: Model<Parent>,
    @InjectModel(Constant.name) private readonly constantModel: Model<Constant>,
    @InjectModel(EnrollHistory.name)
    private readonly enrollHistoryModel: Model<EnrollHistory>,
  ) {
    super();
  }

  async subscriptions(params: {
    membership: { stripeProductId: string; key: string; totalPrice: number };
    customerId: string;
    paymentMethodId: string;
    trialEndTime: string | Date;
    billingSettings: any;
  }) {
    const productId = params.membership.stripeProductId;
    const intervalType = params.membership.key === MEMBER_TYPE.monthly ? 'month' : 'year';
    try {
      const amount = params.membership.totalPrice * 100;
      const currency = 'usd';

      const price = await this.priceStripeService.create({
        amount,
        currency,
        intervalType,
        productId,
      });

      const subscription = await this.subscriptionStripeService.create({
        customerId: params.customerId,
        priceId: price.id,
        trialEndTime: params.trialEndTime,
        paymentMethodId: params.paymentMethodId,
        billingSettings: params.billingSettings,
      });
      return subscription;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async generateInvoice(params: { invoiceAliasId: string }) {
    const id = params.invoiceAliasId;
    try {
      const invoice = await this.invoiceModel.findOne({ aliasId: id }).lean();

      if (!invoice) {
        throw new Error('No invoice found (2)');
      }
      const stripeInvoice = await this.invoiceStripeService.retrieve(invoice.partnerInvoiceId);
      if (!stripeInvoice) {
        throw new Error('No invoice found (3)');
      }

      //console.log("stripeInvoice", stripeInvoice)
      const fileName = `${id}.pdf`;
      const fileUrl = `publics/invoices/${fileName}`;

      const checkExist = await this.s3Service.checkFileExist(fileUrl);

      if (checkExist) {
        const s3FileUrl = `${this.configService.get<string>('AWS_CLOUD_FRONT_URL')}/${fileUrl}`;

        return {
          success: true,
          url: s3FileUrl,
        };
      } else {
        const cusId = stripeInvoice.customer;

        const parent = await this.parentModel.findOne({ stripeCusId: cusId }).lean();

        const invoicePeriod = {
          start: moment.unix(stripeInvoice.lines.data[0].period.start),
          end: moment.unix(stripeInvoice.lines.data[0].period.end),
        };

        const enrollHistory = await this.enrollHistoryModel
          .findOne({ stripeSubscriptionId: invoice.partnerTransactionId })
          .lean();

        const amount = `$${stripeInvoice.total / 100}`;

        const invoiceInfo = `${id} · ${amount} due ${invoicePeriod.start.format('MMMM')} ${invoicePeriod.start.format(
          'DD',
        )}, ${invoicePeriod.start.format('YYYY')}`;

        let productName = '',
          membershipName = '';

        if (enrollHistory.memberType === MEMBER_TYPE.monthly) {
          membershipName = 'Monthly Subscription';
        } else {
          membershipName = 'Yearly Subscription';
        }

        if (invoice.type == INVOICE_TYPE.trial) {
          productName = `14-Day Trial Period For ${membershipName}`;
        } else {
          productName = membershipName;
        }

        const productDuration = `${invoicePeriod.start.format('MMM')} ${invoicePeriod.start.format(
          'DD',
        )} - ${invoicePeriod.end.format('MMM')} ${invoicePeriod.end.format('DD')}, ${invoicePeriod.end.format('YYYY')}`;

        const date = `${invoicePeriod.start.format('MMM')} ${invoicePeriod.start.format(
          'DD',
        )}, ${invoicePeriod.start.format('YYYY')}`;

        const stripeInvoiceCreated = moment.unix(stripeInvoice.created);

        const dateOfIssue = `${stripeInvoiceCreated.format('MMM')} ${stripeInvoiceCreated.format(
          'DD',
        )}, ${stripeInvoiceCreated.format('YYYY')}`;

        const productTitle = `${amount} due ${invoicePeriod.end.format('MMM')} ${invoicePeriod.end.format(
          'DD',
        )}, ${invoicePeriod.end.format('YYYY')}`;

        //console.log("stripeInvoice", stripeInvoice);
        const companyInfo = await this.constantModel.findOne({ key: 'companyInfo' }).lean();

        const data = {
          invoiceNumber: id,
          companyName: companyInfo.value.name,
          companyAddress: companyInfo.value.address,
          //companyPhone: '+8484 4653 353',
          //companyDomain: 'https://www.teefi.io',
          customerName: parent.lastName ? `${parent.firstName} ${parent.lastName}` : parent.firstName,
          customerEmail: parent.email,
          customerAddress: parent.address,
          invoiceInfo: invoiceInfo,
          amount: amount,
          total: amount,
          paidAmount: amount,
          amountDue: amount,
          productName: productName,
          productDuration: productDuration,
          date: date,
          productTitle: productTitle,
          dateOfIssue: dateOfIssue,
        };

        console.log('data', data);
        const urlData = new URLSearchParams(data).toString();

        const options = {
          format: 'A4',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        };
        const file = {
          url: `${process.env.APP_URL}/invoice/dynamic-data?${urlData}`,
        };

        ensureDirPath(`${process.cwd()}/tmp_data`);

        const rs = await this.generatePdf({ file, fileName, fileUrl, options });
        return rs;
      }
    } catch (ex) {
      console.log('ex', ex.message);
      return {
        success: false,
        msg: ex.message,
      };
    }
  }

  generatePdf({ file, options, fileName, fileUrl }): Promise<{ success: boolean; url: string }> {
    return new Promise((rs, rj) => {
      generatePdf(file, options, async (err, buffer) => {
        if (err) {
          rj(err);
        }
        const url = `${process.cwd()}/tmp_data/${fileName}`;

        writeFileSync(url, buffer);

        const uploadRs = await this.s3Service.uploadLocalFileToS3(url, fileUrl);

        rs({
          success: true,
          url: uploadRs,
        });
      });
    });
  }
}
