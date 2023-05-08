import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Created {
  @Field(() => Boolean)
  created: boolean;
}
