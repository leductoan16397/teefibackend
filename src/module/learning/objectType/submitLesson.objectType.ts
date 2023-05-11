import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SubmitLesson {
  @Field(() => Number, { nullable: true })
  earned: number;

  @Field(() => Number, { nullable: true })
  totalEarnedQuiz: number;

  @Field(() => Number, { nullable: true })
  totalEarnedLevel: number;

  @Field(() => Boolean, { nullable: true })
  success: boolean;

  @Field(() => String, { nullable: true })
  rightAnswerKey: string;

  @Field(() => String, { nullable: true })
  rightAnswerId: string;
}
