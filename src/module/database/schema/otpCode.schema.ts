import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument , Types} from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';

export type OtpCodeDocument = HydratedDocument<OtpCode>;


export type OtpCodeLeanDoc = OtpCode & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.OTP_CODE,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class OtpCode {
  @Prop({ default: '' })
  type: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ default: '' })
  code: string;

  @Prop({ default: 0 })
  currentValid: number;

  @Prop({ default: 0 })
  limitInvalid: number;

  @Prop({ required: true })
  expireTime: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const OtpCodeSchema = SchemaFactory.createForClass(OtpCode);

OtpCodeSchema.loadClass(OtpCode);
