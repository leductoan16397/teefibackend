import { Module } from '@nestjs/common';
import { CustomerStripeService } from './service/customer.stripe.service';
import { InvoiceStripeService } from './service/invoice.stripe.service';
import { PaymentMethodStripeService } from './service/paymentMethod.stripe.service';
import { PriceStripeService } from './service/price.stripe.service';
import { ProductStripeService } from './service/product.stripe.service';
import { SourceStripeService } from './service/source.stripe.service';
import { SubscriptionStripeService } from './service/subscription.stripe.service';
import { AWSModule } from 'src/module/aws/aws.module';
import { StripeGateway } from './stripe.gateway';
import { InvoicePaidService } from './service/invoicePaid.service';
import { CustomerChargeSucceeded } from './service/customerChargeSucceeded.service';
import { CustomerSubscriptionCreated } from './service/customerSubscriptionCreated.service';
import { EmailModule } from 'src/module/email/email.module';
import { PaymentController } from './payment.controller';
import { PaymentMobileStatusController } from './paymentMobileStatus.controller';
import { InvoiceController } from './invoice.controller';

@Module({
  imports: [AWSModule, EmailModule],
  providers: [
    CustomerStripeService,
    StripeGateway,
    InvoiceStripeService,
    PaymentMethodStripeService,
    PriceStripeService,
    ProductStripeService,
    SourceStripeService,
    SubscriptionStripeService,
    InvoicePaidService,
    CustomerChargeSucceeded,
    CustomerSubscriptionCreated,
  ],
  exports: [
    CustomerStripeService,
    StripeGateway,
    InvoiceStripeService,
    PaymentMethodStripeService,
    PriceStripeService,
    ProductStripeService,
    SourceStripeService,
    SubscriptionStripeService,
    InvoicePaidService,
    CustomerChargeSucceeded,
    CustomerSubscriptionCreated,
  ],
  controllers: [
    PaymentController,
    PaymentMobileStatusController,
    InvoiceController,
  ],
})
export class StripeModule {}
