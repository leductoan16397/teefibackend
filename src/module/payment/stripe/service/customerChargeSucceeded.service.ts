import { Injectable } from '@nestjs/common';
import { StripeEventAbstract } from '../abstract/stripeEvent.abstract';

@Injectable()
export class CustomerChargeSucceeded extends StripeEventAbstract {
  constructor() {
    super();
  }

  process() {
    console.log('customerChargeSucceeded this.params');
  }
}
