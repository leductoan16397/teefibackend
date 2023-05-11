import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
class BaseInfo {
  @Field(() => Number, { nullable: true })
  earning?: number;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => Number, { nullable: true })
  earned?: number;
}

@ObjectType()
class Source {
  @Field(() => String, { nullable: true })
  videoId?: string;
  @Field(() => String, { nullable: true })
  hashCode?: string;
}

@ObjectType()
class IntroductionInfo extends BaseInfo {
  @Field(() => Source, { nullable: true })
  src: Source;
}

@ObjectType()
class GameInfo extends BaseInfo {
  @Field(() => String, { nullable: true })
  src?: string;
}

@ObjectType()
class AnswerInfo {
  @Field(() => String, { nullable: true })
  _id?: string;
  @Field(() => String, { nullable: true })
  key?: string;
  @Field(() => String, { nullable: true })
  value?: string;
}

@ObjectType()
class QuestionInfo extends BaseInfo {
  @Field(() => String, { nullable: true })
  _id?: string;

  @Field(() => String, { nullable: true })
  question?: string;

  @Field(() => String, { nullable: true })
  answerKey?: string;
  @Field(() => Int, { nullable: true })
  order?: number;

  @Field(() => [AnswerInfo], { nullable: 'itemsAndList' })
  answers: AnswerInfo[];
}

@ObjectType()
export class LessonInfo {
  @Field(() => String, { nullable: true })
  _id?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  currentPart?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  value?: string;

  @Field(() => String, { nullable: true })
  curriculumLevelId?: string;

  @Field(() => Int, { nullable: true })
  order?: number;

  @Field(() => IntroductionInfo, { nullable: true })
  introduction?: IntroductionInfo;

  @Field(() => IntroductionInfo, { nullable: true })
  story?: IntroductionInfo;

  @Field(() => GameInfo, { nullable: true })
  game?: GameInfo;

  @Field(() => [QuestionInfo], { nullable: 'itemsAndList' })
  questions?: QuestionInfo[];
}
