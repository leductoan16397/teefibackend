import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LoginType {
  @Field(() => String)
  id: string;

  @Field(() => String)
  username: string;

  @Field(() => String)
  role: string;

  @Field(() => String)
  token: string;
}

@ObjectType()
export class PushFcmTokenType {
  @Field(() => Boolean)
  added: boolean;
}

@ObjectType()
export class VerifyOtpType {
  @Field(() => Boolean)
  isValid: boolean;

  @Field(() => String, { nullable: true })
  errorCode: string;

  @Field(() => String, { nullable: true })
  message: string;

  @Field(() => String)
  token: string;
}

@ObjectType()
export class RegisterOtp {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  code: string;

  @Field(() => String)
  expireTime: string;

  @Field(() => String)
  currentValid: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  type: string;
}

@ObjectType()
export class SignUpType {
  @Field(() => String)
  email: string;

  @Field(() => String)
  role: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  token: string;
}

@ObjectType()
export class ResetPasswordType {
  @Field(() => String)
  email: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  token: string;
}
