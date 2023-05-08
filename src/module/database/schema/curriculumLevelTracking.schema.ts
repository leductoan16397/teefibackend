import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';
import { Status } from 'src/common/enum';

export type CurriculumLevelTrackingDocument =
  HydratedDocument<CurriculumLevelTracking>;

  
export type CurriculumLevelTrackingLeanDoc = CurriculumLevelTracking & {
  _id: Types.ObjectId;
};


@Schema({
  collection: COLLECTION_NAME.CURRICULUM_LEVEL_TRACKING,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class CurriculumLevelTracking {
  @Prop({ enum: Status, default: Status.INPROGRESS })
  status: Status;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME.KID,
    required: true,
    immutable: true,
  })
  kidId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME.CURRICULUM_LEVEL,
    required: true,
    immutable: true,
  })
  curriculumLevelId: Types.ObjectId;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const CurriculumLevelTrackingSchema = SchemaFactory.createForClass(
  CurriculumLevelTracking,
);

CurriculumLevelTrackingSchema.loadClass(CurriculumLevelTracking);
