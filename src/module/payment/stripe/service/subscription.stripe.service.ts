import * as moment from 'moment';
import { StripeAbstract } from '../abstract/stripe.abstract';

import { Injectable } from '@nestjs/common';
import {
  ICreate,
  IRetrieve,
  IList,
  ICancel,
} from '../../interface/crud.interface';

@Injectable()
export class SubscriptionStripeService
  extends StripeAbstract
  implements ICreate, IRetrieve, IList, ICancel
{
  static statusCanceled = 'canceled';
  static statusActive = 'active';

  async create(params: {
    trialEndTime: string | Date;
    customerId: string;
    priceId: string;
    paymentMethodId: string;
    billingSettings: {
      aliasId: string;
    };
  }) {
    const trialEndTime = moment(params.trialEndTime).unix();
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: params.customerId,
        items: [
          {
            price: params.priceId, // Replace with your price ID
          },
        ],
        default_payment_method: params.paymentMethodId,
        trial_end: trialEndTime, // Set trial end to the 15th of the month
        billing_cycle_anchor: trialEndTime, // Set billing cycle anchor to the 15th of the month
        collection_method: 'charge_automatically',
        metadata: {
          custom_invoice_number: params.billingSettings.aliasId,
          invoice_number: params.billingSettings.aliasId,
        },
      });

      return subscription;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async retrieve(id: string) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(id);
      return subscription;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async getList(params: { customerId: string }) {
    try {
      const data: any = {};
      if (params.customerId) {
        data.customer_id = params.customerId;
      }
      const subscriptions = await this.stripe.subscriptions.list(data);
      return subscriptions;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async cancel(id: string) {
    try {
      // const subscription = await this.stripe.subscriptions.retrieve(id);
      // console.log("subscription", subscription)
      // const canceledSubscription = await subscription.cancel();
      const canceledSubscription = await this.stripe.subscriptions.update(id, {
        cancel_at_period_end: true,
      });
      return canceledSubscription;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async updatePaymentMethodId(id: string, paymentMethodId: string) {
    try {
      // TODO
      const subscription = await this.stripe.subscriptions.update(id, {
        default_payment_method: paymentMethodId,
      });
      return subscription;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
}
