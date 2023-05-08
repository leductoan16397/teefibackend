import { Global, Module } from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { Certificate } from 'crypto';
import { LogModule } from './log/log.module';
import { AppPushToken, AppPushTokenSchema } from './schema/appPushToken.schema';
import { BlockOTP, BlockOTPSchema } from './schema/blockOtp.schema';
import { CertificateSchema } from './schema/certificate.schema';
import { Constant, ConstantSchema } from './schema/constant.schema';
import {
  CurriculumLesson,
  CurriculumLessonSchema,
} from './schema/curriculumLesson.schema';
import {
  CurriculumLessonTracking,
  CurriculumLessonTrackingSchema,
} from './schema/curriculumLessonsTracking.schema';
import {
  CurriculumLevel,
  CurriculumLevelSchema,
} from './schema/curriculumLevel.schema';
import {
  CurriculumLevelTracking,
  CurriculumLevelTrackingSchema,
} from './schema/curriculumLevelTracking.schema';
import { EventLog, EventLogSchema } from './schema/eventLogs.schema';
import { Feedback, FeedbackSchema } from './schema/feedback.schema';
import {
  FileUploadLog,
  FileUploadLogSchema,
} from './schema/fileUploadLog.schema';
import { Invoice, InvoiceSchema } from './schema/invoice.schema';
import { Kid, KidSchema } from './schema/kid.schema';
import {
  MailCollection,
  MailCollectionSchema,
} from './schema/mailCollection.schema';
import { Membership, MembershipSchema } from './schema/membership.schema';
import { OtpCode, OtpCodeSchema } from './schema/otpCode.schema';
import { ParentSchema, Parent } from './schema/parent.schema';
import { PaymentCard, PaymentCardSchema } from './schema/paymentCard.schema';
import { User, UserSchema } from './schema/user.schema';
import {
  EnrollHistory,
  EnrollHistorySchema,
} from './schema/enrollHistory.schema';

const MODELS: ModelDefinition[] = [
  { name: Kid.name, schema: KidSchema },
  { name: EnrollHistory.name, schema: EnrollHistorySchema },
  { name: User.name, schema: UserSchema },
  { name: Parent.name, schema: ParentSchema },
  { name: AppPushToken.name, schema: AppPushTokenSchema },
  { name: BlockOTP.name, schema: BlockOTPSchema },
  { name: Certificate.name, schema: CertificateSchema },
  { name: Constant.name, schema: ConstantSchema },
  { name: CurriculumLesson.name, schema: CurriculumLessonSchema },
  {
    name: CurriculumLessonTracking.name,
    schema: CurriculumLessonTrackingSchema,
  },
  { name: CurriculumLevel.name, schema: CurriculumLevelSchema },
  { name: CurriculumLevelTracking.name, schema: CurriculumLevelTrackingSchema },
  { name: EventLog.name, schema: EventLogSchema },
  { name: Feedback.name, schema: FeedbackSchema },
  { name: FileUploadLog.name, schema: FileUploadLogSchema },
  { name: Invoice.name, schema: InvoiceSchema },
  { name: MailCollection.name, schema: MailCollectionSchema },
  { name: Membership.name, schema: MembershipSchema },
  { name: OtpCode.name, schema: OtpCodeSchema },
  { name: PaymentCard.name, schema: PaymentCardSchema },
];

@Global()
@Module({
  imports: [MongooseModule.forFeature(MODELS), LogModule],
  exports: [MongooseModule],
})
export class DatabaseModule {}
