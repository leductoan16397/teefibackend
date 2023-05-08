import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class StripeEventAbstract {
  constructor() {}

  refactorData() {
    return 123;
  }

  abstract process(data: any): any;
}
