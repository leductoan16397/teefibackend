import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { LoggedUser } from '../auth/passport/auth.type';
import { UserRole } from 'src/common/enum';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Parent } from '../database/schema/parent.schema';
import { Connection, Model } from 'mongoose';
import { PaymentCard } from '../database/schema/paymentCard.schema';
import { EnrollHistory } from '../database/schema/enrollHistory.schema';
import { Invoice } from '../database/schema/invoice.schema';
import * as moment from 'moment';
import { StripeGateway } from '../payment/stripe/stripe.gateway';
import {
  ENROLL_STATUS,
  INVOICE_STATUS,
  INVOICE_TYPE,
  MAIL_COLLECTION_TYPE,
  MEMBER_TYPE,
  PAYMENT,
} from 'src/common/constant';
import { PaymentMethodStripeService } from '../payment/stripe/service/paymentMethod.stripe.service';
import { SubscriptionStripeService } from '../payment/stripe/service/subscription.stripe.service';
import { CustomerStripeService } from '../payment/stripe/service/customer.stripe.service';
import { KidService } from '../kid/kid.service';
import { Kid } from '../database/schema/kid.schema';
import { Membership } from '../database/schema/membership.schema';
import { InvoiceStripeService } from '../payment/stripe/service/invoice.stripe.service';
import { MailCollection } from '../database/schema/mailCollection.schema';
import { PriceStripeService } from '../payment/stripe/service/price.stripe.service';
import { DynamicError } from 'src/common/error';

@Injectable()
export class ParentService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Parent.name) private readonly parentModel: Model<Parent>,
    @InjectModel(Kid.name) private readonly kidModel: Model<Kid>,

    @InjectModel(MailCollection.name)
    private readonly mailCollectionModel: Model<MailCollection>,

    @InjectModel(Membership.name)
    private readonly membershipModel: Model<Membership>,

    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<Invoice> & typeof Invoice,

    @InjectModel(EnrollHistory.name)
    private readonly enrollHistoryModel: Model<EnrollHistory> &
      typeof EnrollHistory,

    @InjectModel(PaymentCard.name)
    private readonly paymentCardModel: Model<PaymentCard>,

    private readonly stripeGateway: StripeGateway,
    private readonly paymentMethodStripeService: PaymentMethodStripeService,
    private readonly subscriptionStripeService: SubscriptionStripeService,
    private readonly customerStripeService: CustomerStripeService,
    private readonly invoiceStripeService: InvoiceStripeService,
    private readonly priceStripeService: PriceStripeService,
    private readonly kidService: KidService,
  ) {}

  async paymentCards({
    loggedUser,
    i18n,
  }: {
    i18n: I18nContext;
    loggedUser: LoggedUser;
  }) {
    try {
      const student = await this.parentModel.findOne({ userId: loggedUser.id });
      const paymentCards = await this.paymentCardModel
        .find({
          userId: student.userId,
          userType: UserRole.PARENT,
        })
        .lean();
      const result = [];
      if (paymentCards) {
        for (const i in paymentCards) {
          result.push({
            _id: paymentCards[i]._id,
            paymentMethodId: paymentCards[i].paymentMethodId,
            memberType: paymentCards[i].memberType,
            isPrimary: paymentCards[i].isPrimary,
            brand: paymentCards[i].infos.brand,
            last4: paymentCards[i].infos.last4,
          });
        }
      }
      return result;
    } catch (error) {
      throw new DynamicError(error);
    }
  }

  async listInvoice({
    loggedUser,
    i18n,
  }: {
    loggedUser: LoggedUser;
    i18n: I18nContext;
  }) {
    try {
      const parent = await this.parentModel.findOne({
        userId: loggedUser.id,
      });
      const enrollHistory = await this.enrollHistoryModel
        .findOne({
          parentId: parent._id,
          kidId: parent.watchingKidId,
        })
        .lean();

      if (!enrollHistory) {
        throw new Error('No active subscription plan found');
      }

      const subscriptionId = enrollHistory.stripeSubscriptionId;
      const tmpListInvoice = await this.invoiceModel
        .find({
          partnerTransactionId: subscriptionId,
          status: INVOICE_STATUS.success,
        })
        .lean();

      console.log('tmpListInvoice', tmpListInvoice);
      const listInvoice = [];

      if (tmpListInvoice && tmpListInvoice.length) {
        let tmp: any;

        for (const i in tmpListInvoice) {
          tmp = {
            _id: tmpListInvoice[i]._id,
            amount: `${tmpListInvoice[i].currency}${tmpListInvoice[i].amount}`,
            fileUrl: null,
            createdAt: moment(tmpListInvoice[i].createdAt).format(
              'MMM DD, YYYY',
            ),
          };

          if (tmpListInvoice[i].aliasId) {
            const result = await this.stripeGateway.generateInvoice({
              invoiceAliasId: tmpListInvoice[i].aliasId,
            });
            tmp.fileUrl = result && result.success ? result.url : null;
          }

          listInvoice.push(tmp);
        }
      }
      return listInvoice;
    } catch (error) {
      console.log(error.message);
      throw new DynamicError(error);
    }
  }

  async addPaymentCard({
    loggedUser,
    i18n,
    paymentMethodId,
  }: {
    loggedUser: LoggedUser;
    i18n: I18nContext;
    paymentMethodId: string;
  }) {
    const parent = await this.parentModel.findOne({ userId: loggedUser.id });
    try {
      const studentCard = await this.paymentCardModel
        .find({
          userId: parent.userId,
          userType: UserRole.PARENT,
        })
        .lean();

      const paymentMethod = await this.paymentMethodStripeService.retrieve(
        paymentMethodId,
      );

      if (!paymentMethod) {
        throw new Error(i18n.t('error.errorDetectCardInfo'));
      }
      if (!paymentMethod.customer) {
        const attachToCustomer =
          await this.paymentMethodStripeService.attachToCustomer(
            paymentMethodId,
            parent.stripeCusId,
          );
      } else if (paymentMethod.customer != parent.stripeCusId) {
        throw new Error(i18n.t('error.errorVerifyPaymentMethodInfo'));
      }

      const addCard = {
        userId: parent.userId,
        userType: UserRole.PARENT,
        fingerprint: paymentMethod.card.fingerprint,
        infos: paymentMethod.card,
        paymentMethodId: paymentMethodId,
        //memberType: memberType,
        isPrimary: studentCard.length ? 0 : 1,
      };

      // check exist card
      let isAdd = 1;
      if (studentCard.length) {
        for (const i in studentCard) {
          if (
            studentCard[i].userId.toString() === parent.userId.toString() &&
            studentCard[i].userType === UserRole.PARENT &&
            studentCard[i].fingerprint === paymentMethod.card.fingerprint
          ) {
            isAdd = 0;
          }
          if (studentCard[i].isPrimary == 1) {
            addCard.isPrimary = 0;
          }
        }
      }

      if (!isAdd) {
        throw new Error(i18n.t('error.errorCardNumberAlreadyExist'));
      }

      const card = await new this.paymentCardModel({
        ...addCard,
        createdBy: parent.userId,
        createdByUserType: UserRole.PARENT,
      }).save();

      return card;
    } catch (ex) {
      console.log(ex.message);

      throw new DynamicError(ex);
    }
  }

  async deletePaymentCard({
    loggedUser,
    i18n,
    paymentCardId,
  }: {
    loggedUser: LoggedUser;
    i18n: I18nContext;
    paymentCardId: string;
  }) {
    const parent = await this.parentModel.findOne({ userId: loggedUser.id });

    try {
      const card = await this.paymentCardModel.findOne({
        userId: parent.userId,
        userType: UserRole.PARENT,
        _id: paymentCardId,
      });

      if (!card) {
        throw new Error(i18n.t('error.cardNotFound'));
      }

      if (card.isPrimary) {
        throw new Error(i18n.t('error.cannotDeletePrimaryCard'));
      }

      await this.paymentCardModel.deleteOne({
        _id: card._id,
      });

      return {
        success: 1,
      };
    } catch (ex) {
      console.log(ex.message);

      throw new DynamicError(ex);
    }
  }

  async updatePrimaryCard({
    loggedUser,
    i18n,
    paymentCardId,
  }: {
    loggedUser: LoggedUser;
    i18n: I18nContext;
    paymentCardId: string;
  }) {
    const session = await this.connection.startSession();

    const parent = await this.parentModel.findOne({ userId: loggedUser.id });

    try {
      session.startTransaction();

      let card = await this.paymentCardModel
        .findOne({
          userId: parent.userId,
          userType: UserRole.PARENT,
          _id: paymentCardId,
        })
        .session(session)
        .lean();

      if (!card) {
        throw new Error(i18n.t('error.cardNotFound'));
      }

      if (card.isPrimary == 1) {
        throw new Error(i18n.t('error.cardAlreadyPrimary'));
      }

      await this.paymentCardModel.updateMany(
        {
          userId: parent.userId,
          userType: UserRole.PARENT,
        },
        {
          isPrimary: 0,
        },
        {
          session,
        },
      );

      await this.paymentCardModel.findOneAndUpdate(
        {
          userId: parent.userId,
          userType: UserRole.PARENT,
          _id: paymentCardId,
        },
        {
          isPrimary: 1,
          updatedAt: new Date(),
          createdBy: parent.userId,
          createdByUserType: UserRole.PARENT,
        },
        {
          session: session,
        },
      );

      const enrolls = await this.enrollHistoryModel
        .find({
          parentId: parent._id,
        })
        .session(session)
        .lean();

      if (enrolls) {
        for (const i in enrolls) {
          await this.subscriptionStripeService.updatePaymentMethodId(
            enrolls[i].stripeSubscriptionId,
            card.paymentMethodId,
          );
        }
      }

      card = await this.paymentCardModel
        .findOne({
          userId: parent.userId,
          userType: UserRole.PARENT,
          _id: paymentCardId,
        })
        .session(session)
        .lean();

      await session.commitTransaction();
      return card;
    } catch (ex) {
      await session.abortTransaction();
      throw new DynamicError(ex);
    } finally {
      await session.endSession();
    }
  }

  async attachStripeCustomer({ i18n }: { i18n: I18nContext }) {
    try {
      const parents = await this.parentModel
        .find({
          stripeCusId: null,
        })
        .lean();

      if (parents) {
        let customer,
          stripeCusId = null;
        for (const i in parents) {
          customer = await this.customerStripeService.getByEmail(
            parents[i].email,
          );

          customer = customer ? customer.data[0] : false;
          if (customer) {
            stripeCusId = customer.id;
          } else {
            customer = await this.customerStripeService.create({
              email: parents[i].email,
            });
            stripeCusId = customer.id;
          }

          await this.parentModel.findOneAndUpdate(
            {
              _id: parents[i]._id,
            },
            {
              stripeCusId: stripeCusId,
            },
            {
              multi: true,
            },
          );
        }
      }
      return {
        success: 1,
      };
    } catch (error) {
      throw new DynamicError(error);
    }
  }

  async activeChild({
    loggedUser,
    childId,
    i18n,
  }: {
    loggedUser: LoggedUser;
    i18n: I18nContext;
    childId: string;
  }) {
    try {
      const parent = await this.parentModel.findOne({ userId: loggedUser.id });
      const kid = await this.kidModel.findOne({
        parentId: parent._id,
        _id: childId,
      });

      if (!kid) {
        throw new Error(i18n.t('error.kidNotFound'));
      }

      await this.parentModel.findOneAndUpdate(
        {
          _id: parent._id,
        },
        {
          watchingKidId: kid._id,
        },
      );

      return await this.kidService.kidsByManager({ user: loggedUser, i18n });
    } catch (ex) {
      console.log(ex.message);
      throw new DynamicError(ex);
    }
  }

  async enroll({
    i18n,
    loggedUser,
    memberType,
    enrollFor,
  }: {
    loggedUser: LoggedUser;
    i18n: I18nContext;
    memberType: string;
    enrollFor: string;
  }) {
    const parent = await this.parentModel.findOne({ userId: loggedUser.id });

    let enrollUser = parent;
    let kidId = null;

    if (parent._id.toString() !== enrollFor) {
      enrollUser = await this.kidModel.findOne({ _id: enrollFor }).lean();
      kidId = enrollUser._id;
    }

    if (!enrollUser) {
      throw new BadRequestException(i18n.t('error.errorUserExist'));
    }

    const paymentCard = await this.paymentCardModel
      .findOne({
        userId: parent.userId,
        userType: UserRole.PARENT,
        isPrimary: 1,
      })
      .lean();

    if (!paymentCard) {
      throw new BadRequestException(i18n.t('error.errorDetectCardInfo'));
    }

    const membership = await this.membershipModel
      .findOne({
        key: memberType,
      })
      .lean();

    if (!membership) {
      throw new BadRequestException(i18n.t('error.errorMemberTypeNotFound'));
    }

    const currentEnroll = await this.enrollHistoryModel.findOne({
      parentId: parent._id,
      kidId: kidId,
    });

    if (MEMBER_TYPE[enrollUser.memberType]) {
      if (!currentEnroll || currentEnroll.isRecurring == 1) {
        throw new BadRequestException(
          i18n.t('error.errorStudentStillMembership'),
          enrollUser.memberType,
        );
      }
    }

    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const numEnrollHistory = await this.enrollHistoryModel
        .countDocuments({
          parentId: parent._id,
          kidId: kidId,
          //status: 'success'
        })
        .session(session);

      const isFirstPay = numEnrollHistory ? 0 : 1;

      const expireTime = await this.enrollHistoryModel.getMemberExpireTime({
        membership,
        type: isFirstPay ? MEMBER_TYPE.freeTrial : membership.key,
        isFirstPay: isFirstPay,
      });

      let historyData = {
        parentId: parent._id,
        kidId: kidId,
        memberType: memberType,
        price: membership.price,
        discount: membership.discount,
        totalPrice: membership.totalPrice,
        currency: membership.currency,
        expireTime: expireTime,
        stripeSubscriptionId: undefined,
        invoiceId: undefined,
      };

      let aliasId = '';
      const prefix = this.invoiceModel.prefix();

      if (isFirstPay) {
        aliasId = await this.invoiceModel.generateTrialAliasId();
      } else {
        aliasId = await this.invoiceModel.generatePaidAliasId();
      }

      let invoiceData = {
        aliasId: aliasId,
        parentId: parent._id,
        kidId: kidId,
        provider: PAYMENT.provider.stripe,
        paymentMethod: PAYMENT.method.creditCard,
        amount: membership.totalPrice,
        currency: membership.currency,
        title: `${membership.key} membership`,
        status: INVOICE_STATUS.success,
        partnerTransactionId: undefined,
      };

      //add subscription

      const subscriptions = await this.stripeGateway.subscriptions({
        customerId: parent.stripeCusId,
        membership: membership,
        trialEndTime: expireTime.toString(),
        paymentMethodId: paymentCard.paymentMethodId,
        // parent: parent,
        billingSettings: {
          aliasId: aliasId,
          prefix: prefix,
        },
      });
      //console.log("subscriptions >>>>>>", subscriptions);

      historyData.stripeSubscriptionId = invoiceData.partnerTransactionId =
        subscriptions.id;

      //create invoice
      const stripeInvoice = (
        await this.invoiceStripeService.getRecentInvoice(subscriptions.id)
      ).data[0];

      const invoiceType = isFirstPay ? INVOICE_TYPE.trial : INVOICE_TYPE.paid;

      invoiceData = {
        ...invoiceData,
        ...{
          partnerInvoiceId: stripeInvoice.id,
          type: invoiceType,
          amount: isFirstPay ? 0 : invoiceData.amount,
        },
      };

      const invoice = await new this.invoiceModel({
        ...invoiceData,
        createdBy: parent.userId,
        createdByUserType: UserRole.PARENT,
      }).save({ session });

      //create enroll history
      historyData = {
        ...historyData,
        ...{
          isRecurring: 1,
          invoiceId: invoice._id,
          status: isFirstPay ? ENROLL_STATUS.trial : ENROLL_STATUS.paid,
        },
      };

      historyData.invoiceId = invoice._id;

      if (currentEnroll && currentEnroll._id) {
        await this.enrollHistoryModel
          .deleteOne({ _id: currentEnroll._id })
          .session(session);
      }

      const enrollHistory = await new this.enrollHistoryModel({
        ...historyData,
        createdByUserType: 'system',
      }).save({ session });

      if (kidId) {
        await this.kidModel.findOneAndUpdate(
          {
            _id: kidId,
          },
          {
            memberType: historyData.memberType,
            createdByUserType: 'system',
          },
          {
            session: session,
            enableLog: 1,
          },
        );

        await this.parentModel.findOneAndUpdate(
          {
            _id: invoice.parentId,
          },
          {
            watchingKidId: kidId,
            createdByUserType: 'system',
          },
          {
            session: session,
            enableLog: 1,
          },
        );
      } else {
        await this.parentModel.findOneAndUpdate(
          {
            _id: invoice.parentId,
          },
          {
            memberType: historyData.memberType,
            createdByUserType: 'system',
          },
          {
            session: session,
            enableLog: 1,
          },
        );
      }
      //move mail collection to potential customer
      const checkMailCollection = await this.mailCollectionModel
        .findOne({
          email: parent.email,
          userType: UserRole.PARENT,
        })
        .session(session)
        .lean();

      if (
        !checkMailCollection ||
        ![
          MAIL_COLLECTION_TYPE.paidCustomer,
          MAIL_COLLECTION_TYPE.paidAndLeaveCustomer,
        ].includes(checkMailCollection.type)
      ) {
        const mailCollection = await this.mailCollectionModel.updateOne(
          {
            email: parent.email,
            userType: UserRole.PARENT,
          },
          {
            email: parent.email,
            type: MAIL_COLLECTION_TYPE.potentialCustomer,
            userId: parent.userId,
            userType: UserRole.PARENT,
            status: 'active',
          },
          {
            upsert: true,
            session: session,
          },
        );
      }

      await session.commitTransaction();

      return {
        invoiceId: invoice._id,
      };
    } catch (ex) {
      await session.abortTransaction();
      throw new DynamicError(ex);
    } finally {
      await session.endSession();
    }
  }

  async cancelSubscriptionPlan({
    i18n,
    loggedUser,
  }: {
    loggedUser: LoggedUser;
    i18n: I18nContext;
  }) {
    const parent = await this.parentModel.findOne({ userId: loggedUser.id });
    try {
      const enrollHistory = await this.enrollHistoryModel
        .findOne({
          parentId: parent._id,
          kidId: parent.watchingKidId,
        })
        .lean();

      console.log('enrollHistory', enrollHistory);
      if (!enrollHistory) {
        throw new Error('No active subscription plan found');
      }

      const cancelSubscription = await this.subscriptionStripeService.cancel(
        enrollHistory.stripeSubscriptionId,
      );

      const foo = await this.enrollHistoryModel.findOneAndUpdate(
        {
          parentId: parent._id,
          kidId: parent.watchingKidId,
        },
        {
          isRecurring: 0,
          createdBy: parent.userId,
          createdByUserType: UserRole.PARENT,
        },
        {
          enableLog: 1,
        },
      );
      return {
        success: 1,
      };
    } catch (ex) {
      console.log(ex.message);
      throw new DynamicError(ex);
    }
  }

  async updateMembership({
    i18n,
    loggedUser,
    memberType,
  }: {
    loggedUser: LoggedUser;
    i18n: I18nContext;
    memberType: string;
  }) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const parent = await this.parentModel.findOne({ userId: loggedUser.id });

      if (!parent.watchingKidId) {
        throw new Error('No child activated');
      }

      // parent
      const kid = await this.kidModel.findOne({ _id: parent.watchingKidId });

      if (kid.memberType === memberType) {
        throw new Error('The membership is same, no need to update');
      }

      const membership = await this.membershipModel
        .findOne({ key: memberType })
        .lean();

      const enrollHistory = await this.enrollHistoryModel
        .findOne({
          parentId: parent._id,
          kidId: parent.watchingKidId,
        })
        .lean();

      const subscriptionId = enrollHistory.stripeSubscriptionId;

      const subscription = await this.subscriptionStripeService.retrieve(
        subscriptionId,
      );
      const curPrice = subscription.items.data[0].price;

      const amount = membership.price * 100;
      const intervalType =
        membership.key == MEMBER_TYPE.monthly ? 'month' : 'year';

      const newPrice = await this.priceStripeService.update({
        id: curPrice.id,
        params: {
          amount,
          interval: intervalType,
          // currency: 'usd',
          // recurring: { interval: intervalType },
        },
      });

      if (!newPrice) {
        throw new Error(
          'Unavailable to change membership now, please try again later',
        );
      }

      await this.enrollHistoryModel.findOneAndUpdate(
        {
          kidId: parent.watchingKidId,
          parentId: parent._id,
        },
        {
          memberType: membership.key,
          price: membership.price,
          discount: membership.discount,
          totalPrice: membership.totalPrice,
          createdByUserType: UserRole.PARENT,
          createdBy: parent.userId,
        },
        {
          session: session,
          enableLog: 1,
        },
      );

      await this.kidModel.findOneAndUpdate(
        {
          _id: parent.watchingKidId,
        },
        {
          memberType: memberType,
          createdByUserType: UserRole.PARENT,
          createdBy: parent.userId,
        },
        {
          session: session,
          enableLog: 1,
        },
      );

      await this.paymentCardModel.findOneAndUpdate(
        {
          userId: parent.userId,
          userType: UserRole.PARENT,
          isPrimary: 1,
        },
        {
          memberType: memberType,
        },
      );

      console.log('newPrice', newPrice);
      await session.commitTransaction();
      return await this.kidService.kidsByManager({ i18n, user: loggedUser });
    } catch (ex) {
      await session.abortTransaction();
      console.log(ex.message);
      throw new DynamicError(ex);
    } finally {
      await session.endSession();
    }
  }
}
