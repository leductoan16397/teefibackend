import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';

export type MembershipDocument = HydratedDocument<Membership>;

export type MembershipLeanDoc = Membership & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.MEMBERSHIP,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Membership {
  @Prop({ unique: true })
  key: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 0 })
  totalPrice: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: 14 })
  freeTrialDays: number;

  @Prop({ default: null })
  stripeProductId: string;

  @Prop({ default: null })
  currency: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);

MembershipSchema.loadClass(Membership);
