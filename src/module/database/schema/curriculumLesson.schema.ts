import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';

export type CurriculumLessonDocument = HydratedDocument<CurriculumLesson>;

export type CurriculumLessonLeanDoc = CurriculumLesson & {
  _id: Types.ObjectId;
};

@Schema({ _id: false })
class Source {
  @Prop({ type: String, required: true })
  videoId: string;

  @Prop({ type: String, required: true })
  hashCode: string;
}
const SourceSchema = SchemaFactory.createForClass(Source);

@Schema({ _id: false })
class Introduction {
  @Prop({ type: SourceSchema, default: {} })
  src: Source;

  @Prop({ default: 50 })
  earning: number;
}

const IntroductionSchema = SchemaFactory.createForClass(Introduction);

@Schema({ _id: false })
class Game {
  @Prop()
  src: string;

  @Prop({ default: 150 })
  earning: number;
}

const GameSchema = SchemaFactory.createForClass(Game);

@Schema({ _id: true })
class Answer {
  _id: Types.ObjectId;

  @Prop()
  key: string;

  @Prop()
  value: string;
}
const AnswerSchema = SchemaFactory.createForClass(Answer);

@Schema({ _id: true })
class Question {
  _id: Types.ObjectId;

  @Prop()
  question: string;

  @Prop()
  rightAnswerKey: string;

  @Prop({ default: 20 })
  earning: number;

  @Prop({ min: 1, required: true })
  order: number;

  @Prop({
    type: [AnswerSchema],
  })
  answers: Answer[];
}

const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({
  collection: COLLECTION_NAME.CURRICULUM_LESSON,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class CurriculumLesson {
  @Prop({ required: true })
  name: string;

  @Prop({})
  value: string;

  @Prop({})
  level: string;

  @Prop({ required: true, min: 1 })
  order: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    immutable: true,
    ref: COLLECTION_NAME.CURRICULUM_LEVEL,
  })
  curriculumLevelId: Types.ObjectId;

  @Prop({ type: IntroductionSchema, default: {} })
  introduction: Introduction;

  @Prop({ type: IntroductionSchema, default: {} })
  story: Introduction;

  @Prop({ type: GameSchema, default: {} })
  game: Game;

  @Prop({ type: [QuestionSchema], default: [] })
  questions: Question[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const CurriculumLessonSchema = SchemaFactory.createForClass(CurriculumLesson);

CurriculumLessonSchema.loadClass(CurriculumLesson);
