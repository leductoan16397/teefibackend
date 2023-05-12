import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAME, ENV } from 'src/common/constant';
import { UserRole } from 'src/common/enum';
import { uniqueValidator } from 'src/common/schema.utils';

export type PaymentCardDocument = HydratedDocument<PaymentCard>;

export type PaymentCardLeanDoc = PaymentCard & {
  _id: Types.ObjectId;
};

const fingerprintValidateOptions = process.env.NODE_ENV === ENV.prod ? { validate: uniqueValidator } : {};

@Schema({
  collection: COLLECTION_NAME.PAYMENT_CARD,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class PaymentCard {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME.USER,
    required: true,
    immutable: true,
  })
  userId: Types.ObjectId;

  @Prop({ enum: UserRole })
  userType: UserRole;

  @Prop({ ...fingerprintValidateOptions })
  fingerprint: string;

  @Prop({ type: Object })
  infos: any;

  @Prop({})
  paymentMethodId: string;

  @Prop({})
  memberType: string;

  @Prop({ default: 1 })
  isPrimary: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PaymentCardSchema = SchemaFactory.createForClass(PaymentCard);

PaymentCardSchema.loadClass(PaymentCard);
