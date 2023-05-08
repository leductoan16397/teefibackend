import { Module } from '@nestjs/common';
import { ParentResolver } from './parent.resolver';
import { ParentService } from './parent.service';
import { StripeModule } from '../payment/stripe/stripe.module';
import { KidModule } from '../kid/kid.module';

@Module({
  imports: [StripeModule, KidModule],
  providers: [ParentResolver, ParentService],
})
export class ParentModule {}
