import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UploadObjectType {
  @Field(() => String, { nullable: true })
  url: string;
}

@ObjectType()
export class UploadsObjectType {
  @Field(() => [String], { nullable: 'items' })
  urls: string[];
  @Field(() => String, { nullable: true })
  status: string;
}
