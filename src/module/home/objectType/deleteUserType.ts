import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteUserType {
  @Field(() => [String], { nullable: 'items' })
  reasons: string[];
}
