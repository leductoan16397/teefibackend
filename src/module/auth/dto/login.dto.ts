import { InputType, Field, ObjectType } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field(() => String, { description: 'username or email', nullable: false })
  username: string;

  @Field(() => String, { description: 'password', nullable: false })
  password: string;

  @Field(() => String, { description: 'Login type(kid|parent|....)' })
  type: string;

  @Field(() => String, { description: 'Firebase Token' })
  fcmToken: string;

  @Field(() => String, { description: 'Device Id' })
  deviceId: string;

  @Field(() => String, { description: 'Device platform (ios|android)' })
  platform: string;
}
