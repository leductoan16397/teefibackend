import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';
import { uniqueValidator } from 'src/common/schema.utils';

export type CurriculumLevelDocument = HydratedDocument<CurriculumLevel>;

export type CurriculumLevelLeanDoc = CurriculumLevel & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.CURRICULUM_LEVEL,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class CurriculumLevel {
  @Prop({
    validate: uniqueValidator,
    required: true,
  })
  key: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 1 })
  order: number;

  @Prop({ required: true })
  certificateImage: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: COLLECTION_NAME.CURRICULUM_LESSON,
    required: true,
  })
  lessonIds: Types.ObjectId[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const CurriculumLevelSchema = SchemaFactory.createForClass(CurriculumLevel);

CurriculumLevelSchema.loadClass(CurriculumLevel);
