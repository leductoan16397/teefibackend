import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { MailService, MailDataRequired } from '@sendgrid/mail';

export interface AttachmentData {
  content: string;
  filename: string;
  type?: string;
  disposition?: string;
  contentId?: string;
}

export abstract class SendGridService {
  protected sendGridService: MailService;
  protected fromEmail: string;
  protected templateId: string;
  protected dynamicData: any;
  protected attachments?: AttachmentData[];

  constructor(
    @Inject(ConfigService) protected readonly configService: ConfigService,
  ) {
    this.sendGridService = sgMail;
    this.sendGridService.setApiKey(
      this.configService.get<string>('SENDGRID_API_KEY'),
    );
    this.fromEmail = configService.get<string>('SENDGRID_MAIL_FROM');
  }

  async send(email: string) {
    const data: MailDataRequired = {
      from: { name: 'TeeFi', email: this.fromEmail },
      to: email,
      templateId: this.templateId,
      dynamicTemplateData: this.dynamicData,
      attachments: this.attachments,
    };
    this.sendGridService
      .send(data)
      .then((rs) => {
        console.log(
          '🚀 ~ file: email.abstract.ts:28 ~ SendGridService ~ this.sendGridService.send ~ rs:',
          rs[0].statusCode,
        );
      })
      .catch((err) => {
        console.log(
          '🚀 ~ file: email.abstract.ts:36 ~ SendGridService ~ send ~ err:',
          err,
        );
      });
  }

  async sendMultiple(emails: string[]) {
    const data: MailDataRequired = {
      from: { name: 'TeeFi', email: this.fromEmail },
      to: emails,
      templateId: this.templateId,
      dynamicTemplateData: this.dynamicData,
      isMultiple: true,
      attachments: this.attachments,
    };
    this.sendGridService.sendMultiple(data)   
      .then((rs) => {
      console.log(
        '🚀 ~ file: email.abstract.ts:28 ~ SendGridService ~ this.sendGridService.send ~ rs:',
        rs[0].statusCode,
      );
    })
    .catch((err) => {
      console.log(
        '🚀 ~ file: email.abstract.ts:36 ~ SendGridService ~ send ~ err:',
        err,
      );
    });
  }

  abstract setDynamicData(data: any): void;
}
