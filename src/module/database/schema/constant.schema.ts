import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';
import { uniqueValidator } from 'src/common/schema.utils';

export type ConstantDocument = HydratedDocument<Constant>;

export type ConstantLeanDoc = Constant & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.CONSTANT,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Constant {
  @Prop({ validate: uniqueValidator })
  key: string;

  @Prop({ type: Object })
  value: any;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ConstantSchema = SchemaFactory.createForClass(Constant);

ConstantSchema.loadClass(Constant);
