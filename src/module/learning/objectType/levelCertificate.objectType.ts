import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LevelCertificate {
  @Field(() => String, { nullable: true })
  keyName?: string;

  @Field(() => String, { nullable: true })
  key?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => String, { nullable: true })
  note?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  fileUrl?: string;
}
