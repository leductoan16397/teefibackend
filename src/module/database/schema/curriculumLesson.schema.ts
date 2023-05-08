import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {
  HydratedDocument,
  Types,
  Document,
} from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';

export type CurriculumLessonDocument = HydratedDocument<CurriculumLesson>;


export type CurriculumLessonLeanDoc = CurriculumLesson & {
  _id: Types.ObjectId;
};


@Schema({ _id: false })
class Introduction {
  @Prop()
  src: string;

  @Prop()
  earning: number;
}

const IntroductionSchema = SchemaFactory.createForClass(Introduction);

@Schema({ _id: false })
class Game {
  @Prop()
  src: string;

  @Prop()
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

  @Prop()
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

  @Prop({ required: true, min: 1 })
  order: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    immutable: true,
    ref: COLLECTION_NAME.CURRICULUM_LEVEL,
  })
  curriculumLevelId: Types.ObjectId;

  @Prop({ type: IntroductionSchema })
  introduction: Introduction;

  @Prop({ type: IntroductionSchema })
  story: Introduction;

  @Prop({ type: GameSchema })
  game: Game;

  @Prop({ type: [QuestionSchema] })
  questions: Question[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const CurriculumLessonSchema =
  SchemaFactory.createForClass(CurriculumLesson);

CurriculumLessonSchema.loadClass(CurriculumLesson);
