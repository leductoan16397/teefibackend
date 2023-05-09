import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { OtpEmailService } from './service/otpEmail.service';
import { PaymentInvoiceEmailService } from './service/paymentInvoiceEmail.service';
import { AWSModule } from '../aws/aws.module';

@Module({
  imports: [AWSModule],
  providers: [EmailService, OtpEmailService, PaymentInvoiceEmailService],
  exports: [EmailService],
})
export class EmailModule {}
