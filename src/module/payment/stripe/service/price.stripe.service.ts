import { INTERVAL_TYPE } from 'src/common/constant';
import { ICreate, IUpdate } from '../../interface/crud.interface';
import { StripeAbstract } from '../abstract/stripe.abstract';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PriceStripeService
  extends StripeAbstract
  implements IUpdate, ICreate
{
  async update({
    id,
    params,
  }: {
    id: string;
    params: { amount: number; interval: INTERVAL_TYPE };
  }) {
    try {
      const price = await this.stripe.prices.update(id, {
        currency_options: {
          usd: {
            unit_amount: params.amount,
          },
        },
        metadata: {
          interval: params.interval,
        },
        // recurring: {
        //   interval: params.interval,
        // },
      });
      return price;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async create({
    amount,
    currency,
    intervalType,
    productId,
  }: {
    amount: number;
    currency: string;
    intervalType: INTERVAL_TYPE;
    productId: string;
  }) {
    try {
      const price = await this.stripe.prices.create({
        unit_amount: amount,
        currency: currency,
        recurring: { interval: intervalType },
        product: productId,
      });
      return price;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
}
