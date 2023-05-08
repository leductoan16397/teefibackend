import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
class Lesson {
  @Field(() => String, { nullable: true })
  _id?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true })
  order?: number;
}

@ObjectType()
export class LessonData {
  @Field(() => [Lesson], { nullable: 'items' })
  data: Lesson[];
}
