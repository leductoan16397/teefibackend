import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UniqueObjectType {
  @Field(() => Int, { nullable: true })
  isUnique?: number;
}

@ObjectType()
export class IsDeletedObjectType {
  @Field(() => Int, { nullable: true })
  isDelete?: number;
}

@ObjectType()
export class IsUpdatedObjectType {
  @Field(() => Boolean, { nullable: true })
  isUpdated?: boolean;
}
