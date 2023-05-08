import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument,  Types } from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';

export type PaymentCardDocument = HydratedDocument<PaymentCard>;

export type PaymentCardLeanDoc = PaymentCard & {
  _id: Types.ObjectId;
};

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

  @Prop({})
  userType: string;
  
  @Prop({ unique: true })
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
