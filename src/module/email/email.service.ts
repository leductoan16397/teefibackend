import { Injectable } from '@nestjs/common';
import { OtpEmailService } from './service/otpEmail.service';
import { PaymentInvoiceEmailService } from './service/paymentInvoiceEmail.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly otpEmailService: OtpEmailService,
    private readonly paymentInvoiceEmailService: PaymentInvoiceEmailService,
  ) {}

  async sendOtpMail({
    expireTime,
    otpCode,
    email,
  }: {
    expireTime: string;
    otpCode: string | number;
    email: string;
  }) {
    this.otpEmailService.setDynamicData({ expireTime, otpCode });
    await this.otpEmailService.send(email);
  }

  async sendPaymentInvoice({
    isTrial,
    memberType,
    invoicePdf,
    invoiceName,
    name,
    activeTime,
    email,
  }: {
    isTrial: any;
    memberType: any;
    invoicePdf: any;
    invoiceName: any;
    name: any;
    activeTime: any;
    email: any;
  }) {
    await this.paymentInvoiceEmailService.setDynamicData({
      activeTime,
      isTrial,
      memberType,
      name,
    });

    await this.paymentInvoiceEmailService.setAttachments({
      invoiceName,
      invoicePdf,
    });

    await this.paymentInvoiceEmailService.send(email);
  }
}
