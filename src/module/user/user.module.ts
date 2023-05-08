import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { AWSModule } from '../aws/aws.module';
import { StripeModule } from '../payment/stripe/stripe.module';

@Module({
  imports: [AWSModule, StripeModule],
  providers: [UserResolver, UserService],
})
export class UserModule {}
