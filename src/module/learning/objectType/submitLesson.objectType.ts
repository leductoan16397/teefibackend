import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SubmitLesson {
  @Field(() => Int, { nullable: true })
  earned: number;

  @Field(() => Int, { nullable: true })
  totalEarnedQuiz: number;

  @Field(() => Int, { nullable: true })
  totalEarnedLevel: number;

  @Field(() => Boolean, { nullable: true })
  success: boolean;

  @Field(() => String, { nullable: true })
  rightAnswerKey: string;

  @Field(() => String, { nullable: true })
  rightAnswerId: string;
}
