import { ICreate, IList } from '../../interface/crud.interface';
import { StripeAbstract } from '../abstract/stripe.abstract';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductStripeService extends StripeAbstract implements ICreate, IList {
  async getList() {
    try {
      const products = await this.stripe.products.list({ limit: 10 });
      return products;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
  async create({ name }: { name: string }) {
    try {
      const product = await this.stripe.products.create({
        name: name,
      });
      return product;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
}
