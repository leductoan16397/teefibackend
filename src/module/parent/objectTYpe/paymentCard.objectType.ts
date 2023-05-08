import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaymentCardObjectType {
  @Field(() => String, { nullable: true })
  _id?: string;

  @Field(() => String, { nullable: true })
  paymentMethodId: string;

  @Field(() => String, { nullable: true })
  memberType: string;

  @Field(() => String, { nullable: true })
  isPrimary: string;

  @Field(() => String, { nullable: true })
  brand: string;

  @Field(() => String, { nullable: true })
  last4: string;
}

@ObjectType()
export class SuccessObjectType {
  @Field(() => Int, { nullable: true })
  success: number;
}

@ObjectType()
export class UpdatedObjectType {
  @Field(() => Boolean, { nullable: true })
  isUpdated: boolean;
}
