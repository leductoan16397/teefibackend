import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';

export type FileUploadLogDocument = HydratedDocument<FileUploadLog>;

export type FileUploadLogLeanDoc = FileUploadLog & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.FILE_UPLOAD_LOG,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class FileUploadLog {
  @Prop({})
  bucket: string;

  @Prop({})
  key: string;

  @Prop({})
  fileType: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME.USER,
    required: true,
    immutable: true,
  })
  userId: Types.ObjectId;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const FileUploadLogSchema = SchemaFactory.createForClass(FileUploadLog);

FileUploadLogSchema.loadClass(FileUploadLog);
