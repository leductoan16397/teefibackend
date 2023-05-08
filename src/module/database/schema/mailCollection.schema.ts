import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';
import { UserStatus } from 'src/common/enum';

export type MailCollectionDocument = HydratedDocument<MailCollection>;


export type MailCollectionLeanDoc = MailCollection & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.MAIL_COLLECTION,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class MailCollection {
  @Prop({ unique: true })
  email: string;

  @Prop({})
  name: string;

  @Prop({ default: '' })
  type: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME.USER,
    required: true,
    immutable: true,
  })
  userId: Types.ObjectId;

  @Prop({})
  userType: string;

  @Prop({})
  country: string;

  @Prop({ enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const MailCollectionSchema =
  SchemaFactory.createForClass(MailCollection);

MailCollectionSchema.loadClass(MailCollection);
