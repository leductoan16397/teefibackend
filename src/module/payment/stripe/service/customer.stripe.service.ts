import { Injectable } from '@nestjs/common';
import { StripeAbstract } from '../abstract/stripe.abstract';
import { ICreate, IRetrieve, IUpdate } from '../../interface/crud.interface';

@Injectable()
export class CustomerStripeService
  extends StripeAbstract
  implements ICreate, IRetrieve, IUpdate
{
  async create({ email }: { email: string }) {
    try {
      const customer = await this.stripe.customers.create({
        email,
      });
      return customer;
    } catch (ex) {
      throw new Error(ex.message);
    }
  }

  async getByEmail(email: string) {
    try {
      const customer = await this.stripe.customers.list({
        email: email,
      });
      if (customer.data.length > 0) {
        return customer;
      }
      return false;
    } catch (ex) {
      throw new Error(ex.message);
    }
  }

  async getCardInfo(id: string) {
    try {
      const foo = await this.stripe.customers.listSources(id, {
        object: 'card',
      });
      console.log('foo', foo);
      return false;
    } catch (ex) {
      throw new Error(ex.message);
    }
  }

  async retrieve(id: string) {
    try {
      const customer = await this.stripe.customers.retrieve(id);
      return customer;
    } catch (ex) {
      throw new Error(ex.message);
    }
  }

  async update({ id, params }: { id: string; params: any }) {
    console.log('params', params);
    try {
      const customer = await this.stripe.customers.update(id, params);
      return customer;
    } catch (ex) {
      throw new Error(ex.message);
    }
  }

  async createSource(customerId, card) {
    try {
      //   const source = await this.stripe.customers.createSource(customerId, {
      //     source: {
      //       type: 'card',
      //       card: {
      //         number: card.last4,
      //         exp_month: card.exp_month,
      //         exp_year: card.exp_year,
      //         cvc: '123', // Replace with the CVC code for the card
      //       },
      //     },
      //   });
      //   return customer;
    } catch (ex) {
      throw new Error(ex.message);
    }
  }
}
