import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MemberType } from './type';

@ObjectType()
export class PrivatePlan {
  @Field(() => [MemberType], { nullable: 'items' })
  commitmentLevel: MemberType[];

  @Field(() => Int)
  isStandardCurrency: number;
}
