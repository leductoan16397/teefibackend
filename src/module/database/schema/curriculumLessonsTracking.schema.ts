import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';
import { Status } from 'src/common/enum';

export type CurriculumLessonTrackingDocument =
  HydratedDocument<CurriculumLessonTracking>;

export type CurriculumLessonTrackingLeanDoc = CurriculumLessonTracking & {
  _id: Types.ObjectId;
};

@Schema({ _id: false })
class IntroTracking {
  @Prop({ enum: Status })
  status: Status;

  @Prop({ min: 0 })
  earned: number;
}
const IntroTrackingSchema = SchemaFactory.createForClass(IntroTracking);

@Schema({ _id: false })
class GameTracking {
  @Prop({ enum: Status, default: Status.UPCOMING })
  status: Status;

  @Prop({ min: 0 })
  score: number;

  @Prop({ min: 0 })
  earned: number;
}
const GameTrackingSchema = SchemaFactory.createForClass(GameTracking);

@Schema({ _id: false })
class QuestionTracking {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  questionId: Types.ObjectId;

  @Prop({ min: 0 })
  earned: number;

  @Prop({})
  answerKey: string;

  @Prop({ enum: Status, default: Status.UPCOMING })
  status: Status;
}
const QuestionTrackingSchema = SchemaFactory.createForClass(QuestionTracking);

@Schema({
  collection: COLLECTION_NAME.CURRICULUM_LESSON_TRACKING,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class CurriculumLessonTracking {
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
    ref: COLLECTION_NAME.CURRICULUM_LESSON,
    required: true,
    immutable: true,
  })
  curriculumLessonId: Types.ObjectId;

  @Prop({
    type: IntroTrackingSchema,
    default: {
      status: Status.INPROGRESS,
    },
  })
  introduction: IntroTracking;

  @Prop({
    type: IntroTrackingSchema,
    default: {
      status: Status.UPCOMING,
    },
  })
  story: IntroTracking;

  @Prop({ type: GameTrackingSchema, default: {} })
  game: GameTracking;

  @Prop({ type: [QuestionTrackingSchema] })
  questions: QuestionTracking[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const CurriculumLessonTrackingSchema = SchemaFactory.createForClass(
  CurriculumLessonTracking,
);

CurriculumLessonTrackingSchema.loadClass(CurriculumLessonTracking);
