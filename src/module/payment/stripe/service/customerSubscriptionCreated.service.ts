import { Injectable } from '@nestjs/common';
import { StripeEventAbstract } from '../abstract/stripeEvent.abstract';

@Injectable()
export class CustomerSubscriptionCreated extends StripeEventAbstract {
  constructor() {
    super();
  }

  process() {
    console.log('CustomerSubscriptionCreated this.params');
  }
}
