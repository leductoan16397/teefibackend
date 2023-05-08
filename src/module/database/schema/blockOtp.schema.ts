import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';

export type BlockOTPDocument = HydratedDocument<BlockOTP>;


export type BlockOTPLeanDoc = BlockOTP & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.BLOCK_OTP,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class BlockOTP {
  @Prop({ unique: true })
  email: string;

  @Prop({ default: 0 })
  numRequest: number;

  @Prop()
  expireTime: Date;

  @Prop()
  expireBlockTime: Date;

  @Prop({ default: 'normal' })
  status: string;
}

export const BlockOTPSchema = SchemaFactory.createForClass(BlockOTP);

BlockOTPSchema.loadClass(BlockOTP);
