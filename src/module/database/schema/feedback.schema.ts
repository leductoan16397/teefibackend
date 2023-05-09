import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';

export type FeedbackDocument = HydratedDocument<Feedback>;

export type FeedbackLeanDoc = Feedback & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.FEEDBACK,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Feedback {
  @Prop({})
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

  @Prop({ type: Object })
  value: any;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

FeedbackSchema.loadClass(Feedback);
