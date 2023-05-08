import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InvoiceObjectType {
  @Field(() => String, { nullable: true })
  _id?: string;

  @Field(() => String, { nullable: true })
  amount?: string;

  @Field(() => String, { nullable: true })
  fileUrl?: string;

  @Field(() => String, { nullable: true })
  createdAt?: string;
}
