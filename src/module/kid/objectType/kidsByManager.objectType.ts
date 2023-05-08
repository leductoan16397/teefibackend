import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
class KidType {
  @Field(() => String, { nullable: true })
  _id?: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  gender?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => String, { nullable: true })
  birthday?: string;

  @Field(() => Int, { nullable: true })
  balance?: number;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  memberType?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  country?: string;
}

@ObjectType()
class ActiveForKidInfo {
  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => String, { nullable: true })
  gender?: string;

  @Field(() => String, { nullable: true })
  birthday?: string;
}

@ObjectType()
class ActiveFor {
  @Field(() => String, { nullable: true })
  _id?: string;

  @Field(() => String, { nullable: true })
  memberType?: string;

  @Field(() => Int, { nullable: true })
  isEnroll?: number;

  @Field(() => Int, { nullable: true })
  isRecurring?: number;

  @Field(() => String, { nullable: true })
  enrollExpireTime?: string;

  @Field(() => ActiveForKidInfo, { nullable: true })
  info: ActiveForKidInfo;
}

@ObjectType()
export class KidsByManager {
  @Field(() => [KidType], { nullable: 'items' })
  childs: KidType[];

  @Field(() => ActiveFor, { nullable: true })
  activeFor: ActiveFor;
}
