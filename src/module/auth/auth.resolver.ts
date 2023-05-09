import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import {
  LoginType,
  PushFcmTokenType,
  RegisterOtp,
  ResetPasswordType,
  SignUpType,
  VerifyOtpType,
} from './graphQlType/authGraphRes.type';
import { LoggedUser } from './passport/auth.type';
import { GraphqlCurrentUser } from './decorator/loggedUser.decorator';
import { AuthGql } from './decorator/auth.decorator';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Types } from 'mongoose';
import { Request } from 'express';
import validator from 'validator';
import { BadRequestException } from '@nestjs/common';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => RegisterOtp)
  async registerOtp(
    @I18n() i18n: I18nContext,
    @Args('email', { nullable: false }) email: string,
    @Args('type', { nullable: false }) type: string,
    @Args('action', { nullable: true }) action: string,
  ) {
    return this.authService.registerOtp({
      i18n,
      email: email.toLowerCase().trim(),
      type,
      action,
    });
  }

  @Mutation(() => PushFcmTokenType)
  @AuthGql()
  async pushFcmToken(
    @Args('fcmToken', { nullable: false, description: 'firebase token' })
    fcmToken: string,

    @Args('deviceId', { nullable: false }) deviceId: string,

    @Args('platform', {
      nullable: false,
      description: 'Device platform (Android|Ios|Web)',
    })
    platform: string,

    @GraphqlCurrentUser() user: LoggedUser,
  ) {
    return this.authService.pushFcmToken({
      deviceId,
      fcmToken,
      platform,
      userId: new Types.ObjectId(user.id),
      userType: user.role,
    });
  }

  @Mutation(() => VerifyOtpType)
  async verifyOtp(
    @Args('code', { nullable: false, description: 'otp code' }) code: string,
    @Args('email', { nullable: false, description: 'email' }) email: string,
    @Args('type', { nullable: false, description: 'type' }) type: string,
    @I18n() i18n: I18nContext,
  ) {
    return this.authService.verifyOtp({
      code,
      email,
      type,
      i18n,
    });
  }

  @Mutation(() => VerifyOtpType)
  async quickVerifyOtp(
    @Args('code', { nullable: false, description: 'otp code' }) code: string,
    @Args('email', { nullable: false, description: 'email' }) email: string,
    @Args('type', { nullable: false, description: 'type' }) type: string,
    @I18n() i18n: I18nContext,
  ) {
    return this.authService.quickVerifyOtp({
      code,
      email,
      type,
      i18n,
    });
  }

  @Mutation(() => SignUpType)
  async doSignUp(
    @I18n() i18n: I18nContext,
    @Context('req') req: Request,

    @Args('code', { nullable: false }) code: string,

    @Args('email', { nullable: false }) email: string,

    @Args('type', { nullable: false }) type: string,

    @Args('password', { nullable: false }) password: string,

    @Args('name', { nullable: false }) name: string,

    @Args('pinCode', { nullable: true }) pinCode?: string,

    @Args('fcmToken', { nullable: true }) fcmToken?: string,

    @Args('deviceId', { nullable: true }) deviceId?: string,

    @Args('platform', { nullable: true }) platform?: string,
  ) {
    if (!validator.isEmail(email)) {
      throw new BadRequestException(i18n.t('error.errorEmailInvalid'));
    }

    const clientIp = req.ip;
    return this.authService.signUp({
      i18n,
      email: email.toLowerCase().trim(),
      code,
      type,
      password,
      name,
      pinCode,
      fcmToken,
      deviceId,
      platform,
      clientIp,
    });
  }

  @Mutation(() => LoginType)
  async doLogin(
    @Args('username', { nullable: false, description: 'username or email' })
    username: string,
    @Args('password', { nullable: false, description: 'password' })
    password: string,
    @Args('type', {
      nullable: true,
      description: 'Login type(kid|parent|....)',
    })
    type: string,
    @Args('fcmToken', { nullable: true, description: 'Firebase Token' })
    fcmToken: string,
    @Args('deviceId', { nullable: true, description: 'Device Id' })
    deviceId: string,
    @Args('platform', {
      nullable: true,
      description: 'Device platform (ios|android)',
    })
    platform: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.authService.login({
      password,
      username,
      deviceId,
      fcmToken,
      platform,
      type,
      i18n,
    });
  }

  @Mutation(() => ResetPasswordType)
  async resetPassword(
    @I18n() i18n: I18nContext,

    @Args('code', { nullable: false }) code: string,

    @Args('email', { nullable: false }) email: string,

    @Args('type', { nullable: false }) type: string,

    @Args('password', { nullable: false }) password: string,
  ) {
    return this.authService.resetPassword({
      i18n,
      code,
      email,
      type,
      password,
    });
  }
}
