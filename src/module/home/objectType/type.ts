import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MemberType {
  @Field(() => String, { nullable: true })
  key: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  price: string;

  @Field(() => String, { nullable: true })
  totalPrice: string;

  @Field(() => String, { nullable: true })
  discount: string;

  @Field(() => String, { nullable: true })
  freeTrial: string;

  @Field(() => String, { nullable: true })
  billInfo: string;
}
