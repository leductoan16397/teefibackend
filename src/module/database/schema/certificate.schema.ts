import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';

export type CertificateDocument = HydratedDocument<Certificate>;

export type CertificateLeanDoc = Certificate & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.CERTIFICATE,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Certificate {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    immutable: true,
    ref: COLLECTION_NAME.KID,
  })
  kidId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    immutable: true,
    ref: COLLECTION_NAME.CURRICULUM_LEVEL,
  })
  levelId: Types.ObjectId;

  @Prop({ required: true })
  fileUrl: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);

CertificateSchema.loadClass(Certificate);
