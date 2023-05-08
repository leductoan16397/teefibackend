import { ConfigService } from '@nestjs/config';
import { SendGridService } from './email.abstract';
import { Injectable, Scope } from '@nestjs/common';
import { getTimeFormat } from 'src/common/utils';
import { MEMBER_TYPE } from 'src/common/constant';
import { S3Service } from 'src/module/aws/s3.service';

@Injectable({ scope: Scope.REQUEST })
export class PaymentInvoiceEmailService extends SendGridService {
  constructor(
    protected readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {
    super(configService);
    this.templateId = 'd-b74b03486e0c469c8a32c19627e5c463';
  }

  async setDynamicData({
    activeTime,
    isTrial,
    memberType,
    name,
  }: {
    isTrial: any;
    name: any;
    activeTime: any;
    memberType: any;
  }): Promise<void> {
    let paymentFor = '';
    if (isTrial) {
      paymentFor = `Your free trial was activated on ${getTimeFormat(
        activeTime,
      )}`;
    } else {
      if (memberType == MEMBER_TYPE.monthly) {
        paymentFor = `Your monthly subscription was activated on ${getTimeFormat(
          activeTime,
        )}`;
      } else if (memberType == MEMBER_TYPE.yearly) {
        paymentFor = `Your yearly subscription was activated on ${getTimeFormat(
          activeTime,
        )}`;
      }
    }

    this.dynamicData = { name: name, paymentFor: paymentFor };
  }

  async setAttachments({ invoiceName, invoicePdf }) {
    const fileData = await this.s3Service.getObjectFromKey(invoicePdf);

    const attachments = [
      {
        content: fileData.Body.toString(),
        filename: invoiceName,
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ];
    this.attachments = attachments;
  }
}
