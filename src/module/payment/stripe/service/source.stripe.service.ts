import { ICreate } from '../../interface/crud.interface';
import { StripeAbstract } from '../abstract/stripe.abstract';

import { Injectable } from '@nestjs/common';

@Injectable()
export class SourceStripeService extends StripeAbstract implements ICreate {
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
}
