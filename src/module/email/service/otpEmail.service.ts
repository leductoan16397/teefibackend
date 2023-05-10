import { ConfigService } from '@nestjs/config';
import { SendGridService } from './email.abstract';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class OtpEmailService extends SendGridService {
  constructor(protected readonly configService: ConfigService) {
    super(configService);
    this.templateId = 'd-2a059f25a95646ea941e5ee9831ba211';
  }

  setDynamicData({ otpCode, expireTime }: { otpCode: string | number; expireTime: string }): void {
    this.dynamicData = { otpCode, expireTime };
  }
}
