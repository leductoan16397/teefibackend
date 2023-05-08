import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EnrollObjectType {
  @Field(() => String, { nullable: true })
  invoiceId?: string;

  @Field(() => String, { nullable: true })
  payUrl?: string;
}
