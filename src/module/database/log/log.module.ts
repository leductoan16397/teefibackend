import { ParentLogService } from './service/parentLog.service';
import { KidLogService } from './service/kidLog.service';
import { Module } from '@nestjs/common';
import { UserLogService } from './service/userLog.service';
import { EnrollHistoryLogService } from './service/enrollHistoryLog.service';
import { InvoiceLogService } from './service/invoiceLog.service';
import { PaymentCardLogService } from './service/paymentCardLog.service';

@Module({
  providers: [
    UserLogService,
    EnrollHistoryLogService,
    InvoiceLogService,
    KidLogService,
    ParentLogService,
    PaymentCardLogService,
  ],
  exports: [
    UserLogService,
    EnrollHistoryLogService,
    InvoiceLogService,
    KidLogService,
    ParentLogService,
    PaymentCardLogService,
  ],
})
export class LogModule {}
