import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PaymentCardType {
  @Field(() => String, { nullable: true })
  paymentMethodId?: string;
  @Field(() => String, { nullable: true })
  memberType?: string;
}

@ObjectType()
export class LoggedUserType {
  @Field(() => String)
  _id: string;
  @Field(() => String)
  id: string;
  @Field(() => String)
  username: string;
  @Field(() => String)
  role: string;

  @Field(() => String, { nullable: true })
  name?: string;
  @Field(() => String, { nullable: true })
  avatar?: string;
  @Field(() => String, { nullable: true })
  status?: string;
  @Field(() => String, { nullable: true })
  email?: string;
  @Field(() => String, { nullable: true })
  address?: string;
  @Field(() => String, { nullable: true })
  country?: string;
  @Field(() => String, { nullable: true })
  firstName?: string;
  @Field(() => String, { nullable: true })
  lastName?: string;
  @Field(() => String, { nullable: true })
  gender?: string;
  @Field(() => String, { nullable: true })
  memberType?: string;
  @Field(() => String, { nullable: true })
  birthday?: string;
  @Field(() => Int, { nullable: true })
  isRecurring?: string;

  @Field(() => PaymentCardType, { nullable: true })
  paymentCard: PaymentCardType;
}
