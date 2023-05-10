import { COLLECTION_NAME, MEMBER_TYPE } from 'src/common/constant';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import mongoose, { CallbackWithoutResultAndOptionalError, HydratedDocument, SaveOptions, Types } from 'mongoose';
import * as moment from 'moment';
import { Moment } from 'moment';
import { AppModule } from 'src/app.module';
import { EnrollHistoryLogService } from '../log/service/enrollHistoryLog.service';
import { MembershipDocument, MembershipLeanDoc } from './membership.schema';

export type EnrollHistoryDocument = HydratedDocument<EnrollHistory>;

export type EnrollHistoryLeanDoc = EnrollHistory & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.ENROLL_HISTORY,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class EnrollHistory {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME.PARENT,
    immutable: true,
    required: true,
  })
  parentId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME.KID,
    immutable: true,
    required: true,
  })
  kidId: Types.ObjectId;

  @Prop({ default: null })
  memberType: string;

  @Prop({ default: null })
  price: number;

  @Prop({ default: null })
  discount: number;

  @Prop({ default: null })
  totalPrice: number;

  @Prop({ default: null })
  currency: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME.INVOICE,
    default: null,
  })
  invoiceId: Types.ObjectId;

  @Prop({ default: null })
  stripeSubscriptionId: string;

  @Prop({ default: null })
  status: string;

  @Prop({ default: 1 })
  isRecurring: number;

  @Prop({ default: Date.now })
  expireTime: Date;

  static async getMemberExpireTime({
    isFirstPay,
    membership,
    startTime,
    type,
  }: {
    membership: MembershipDocument | MembershipLeanDoc;
    type: string;
    isFirstPay?: number | boolean;
    startTime?: string | Date | Moment;
  }) {
    let expireTime: string | Moment = startTime ? moment(startTime) : moment();
    switch (type) {
      case MEMBER_TYPE.freeTrial:
        expireTime = moment().add(membership.freeTrialDays, 'days').format('YYYY-MM-DD HH:mm:00');
        break;
      case MEMBER_TYPE.monthly:
        // if(isFirstPay){
        // 	console.log("membership.freeTrialDays", membership.freeTrialDays)
        // 	expireTime = expireTime.add(membership.freeTrialDays, 'days');
        // }
        expireTime = expireTime.add(1, 'months').format('YYYY-MM-DD HH:mm:00');
        break;
      case MEMBER_TYPE.yearly:
        // if(isFirstPay){
        // 	expireTime = expireTime.add(membership.freeTrialDays, 'days');
        // }
        expireTime = expireTime.add(1, 'years').format('YYYY-MM-DD HH:mm:00');
        break;
    }
    return expireTime;
  }
}

export const EnrollHistorySchema = SchemaFactory.createForClass(EnrollHistory);

EnrollHistorySchema.loadClass(EnrollHistory);

EnrollHistorySchema.pre('deleteOne', async function (next) {
  console.log('hook remove >>>>');

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const enrollHistoryLogService = appContext.get(EnrollHistoryLogService);

  await enrollHistoryLogService.doRemove({ self: this });

  return next();
});

EnrollHistorySchema.pre('findOneAndUpdate', async function (next) {
  console.log('hook findOneAndUpdate >>>>');

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const enrollHistoryLogService = appContext.get(EnrollHistoryLogService);

  await enrollHistoryLogService.doUpdate({ self: this });
  return next();
});

EnrollHistorySchema.pre('save', async function (next: CallbackWithoutResultAndOptionalError, options: SaveOptions) {
  console.log('hook create >>>>');

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const enrollHistoryLogService = appContext.get(EnrollHistoryLogService);

  const self: any = this as any;
  await enrollHistoryLogService.doCreate({ self, options });
  return next();
});
