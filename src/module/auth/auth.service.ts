import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, QueryOptions, Types } from 'mongoose';
import { TokenPayload, LoggedUser } from './passport/auth.type';
import { AppPushToken } from 'src/module/database/schema/appPushToken.schema';
import { UserRole } from 'src/common/enum';
import { I18nContext } from 'nestjs-i18n';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { OTP_ACTION, otpSignupValidation } from 'src/common/constant';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { getTimeFormat } from 'src/common/utils';
import { PushFcmTokenType } from './graphQlType/authGraphRes.type';
import { BlockOTP } from '../database/schema/blockOtp.schema';
import { OtpCode } from '../database/schema/otpCode.schema';
import { Parent } from '../database/schema/parent.schema';
import { User, UserDocument } from '../database/schema/user.schema';
import { detectCountryViaIP } from 'src/common/clientHelper';
import { CustomerStripeService } from '../payment/stripe/service/customer.stripe.service';
import { MailCollection } from '../database/schema/mailCollection.schema';
import { DynamicError } from 'src/common/error';

@Injectable()
export class AuthService {
  tokenExpireTime: string;
  limitNumberToBlockOtp: number;
  limitMinutesExpireBlockOtp: number;
  limitMinutesExpireOtpCode: number;
  limitInvalidInputOtp: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly customerStripeService: CustomerStripeService,

    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(OtpCode.name) private readonly optCodeModel: Model<OtpCode>,
    @InjectModel(BlockOTP.name) private readonly blockOTPModel: Model<BlockOTP>,
    @InjectModel(Parent.name) private readonly parentModel: Model<Parent>,

    @InjectModel(AppPushToken.name)
    private readonly appPushTokenModel: Model<AppPushToken>,

    @InjectConnection() private connection: Connection,
  ) {
    this.tokenExpireTime = '30d';
    this.limitNumberToBlockOtp = 8;
    this.limitMinutesExpireBlockOtp = 10;
    this.limitMinutesExpireOtpCode = 15;
    this.limitInvalidInputOtp = 10;
  }

  async validateUserByJwt(payload: TokenPayload): Promise<LoggedUser> {
    const user = await this.userModel.findById(payload.id);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      role: user.role,
      status: user.status,
      username: user.username,
    };
  }

  async registerOtp({
    i18n,
    email,
    action,
  }: {
    i18n: I18nContext;
    email: string;
    type: string;
    action: string;
  }) {
    if (action === OTP_ACTION.signup) {
      const checkUser = await this.userModel.findOne({
        username: email,
      });

      if (checkUser) {
        throw new BadRequestException(i18n.t('error.errorUserAlreadyExist'));
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    const currentTime = moment();
    let isDelayTime = false;

    const tmpOtpCode = await this.optCodeModel
      .findOne({
        email: email,
        type: otpSignupValidation,
      })
      .sort({ createdAt: -1 });

    if (tmpOtpCode) {
      const checkTime = moment(tmpOtpCode.createdAt).add(30, 'seconds');
      if (checkTime > currentTime) {
        console.log('delay >>>>>>>>>');
        isDelayTime = true;
      } else {
        console.log('remove code >>>>>>>>>');
        await this.optCodeModel.deleteOne({ _id: tmpOtpCode._id });
      }
    }

    if (isDelayTime) {
      throw new Error(i18n.t('error.errorCanNotRequestContinuously'));
    }

    let blockOtp = await this.blockOTPModel
      .findOne({
        email: email,
        expireTime: { $gt: currentTime.format('YYYY-MM-DD HH:mm:ss') },
        status: 'normal',
      })
      .sort({ createdAt: -1 });

    if (blockOtp) {
      if (blockOtp.numRequest > this.limitNumberToBlockOtp) {
        throw new Error(i18n.t('error.errorBlockOtp'));
      }

      await this.blockOTPModel.updateOne({
        numRequest: blockOtp.numRequest + 1,
      });
    } else {
      blockOtp = await this.blockOTPModel
        .findOne({
          email: email,
          expireBlockTime: { $gt: currentTime.format('YYYY-MM-DD HH:mm:ss') },
          status: 'block',
        })
        .sort({ createdAt: -1 });

      if (blockOtp) {
        throw new Error(i18n.t('error.errorBlockOtp'));
      }

      await this.blockOTPModel.findOneAndRemove({
        email: email,
      });

      await new this.blockOTPModel({
        email: email,
        numRequest: 1,
        expireTime: moment().add(this.limitMinutesExpireBlockOtp, 'minutes'),
        status: 'normal',
      }).save();
    }

    const codeExpireTime = moment()
      .add(this.limitMinutesExpireOtpCode, 'minutes')
      .format('YYYY-MM-DD HH:mm:ss');

    const otpCode = await new this.optCodeModel({
      type: otpSignupValidation,
      email: email,
      code: code,
      limitInvalid: this.limitInvalidInputOtp,
      expireTime: codeExpireTime,
    }).save({});

    const isLiveMode = this.configService.get<number>('IS_LIVE_MODE');
    if (otpCode && isLiveMode == 1) {
      this.emailService.sendOtpMail({
        otpCode: code,
        expireTime: getTimeFormat(codeExpireTime),
        email,
      });
    }

    if (this.configService.get<string>('NODE_ENV') === 'development') {
      return otpCode;
    }

    otpCode.code = null;

    return otpCode;
  }

  async pushFcmToken({
    deviceId,
    fcmToken,
    platform,
    userId,
    userType,
  }: {
    userId: Types.ObjectId;
    userType: UserRole;
    fcmToken: string;
    deviceId: string;
    platform: string;
  }): Promise<PushFcmTokenType> {
    try {
      await this.updateFcmToken({
        deviceId,
        fcmToken,
        platform,
        userId,
        userType,
        options: {
          upsert: true,
        },
      });

      return { added: true };
    } catch (error) {
      throw new DynamicError(error);
    }
  }

  async updateFcmToken({
    deviceId,
    fcmToken,
    options,
    platform,
    userId,
    userType,
  }: {
    userId: Types.ObjectId;
    userType: UserRole;
    fcmToken: string;
    deviceId: string;
    platform: string;
    options?: QueryOptions;
  }) {
    return await this.appPushTokenModel.updateOne(
      {
        userId,
        userType,
      },
      {
        userId,
        userType,
        fcmToken,
        deviceId,
        platform,
      },
      options,
    );
  }

  async generateToken(user: UserDocument) {
    const payload: TokenPayload = {
      id: user._id.toString(),
      role: user.role,
      username: user.username,
    };

    const token = this.jwtService.sign(payload);
    return token;
  }

  async login({
    password,
    username,
    deviceId,
    fcmToken,
    platform,
    i18n,
  }: {
    username: string;
    password: string;
    i18n: I18nContext;
    fcmToken?: string;
    deviceId?: string;
    platform?: string;
    type?: string;
  }) {
    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const user = await this.userModel
        .findOne({
          username,
          isDeleted: false,
        })
        .select('+hashPassword +salt');

      if (!user) {
        throw new Error(i18n.t('error.errorUserExist'));
      }

      const verifyPassword = await user.verifyPassword(password);

      if (!verifyPassword) {
        throw new Error(i18n.t('error.errorPasswordInvalid'));
      }

      if (fcmToken && deviceId) {
        await this.updateFcmToken({
          deviceId,
          fcmToken,
          platform,
          userId: user._id,
          userType: user.role,
          options: {
            upsert: true,
            session,
          },
        });
      }

      const token = await this.generateToken(user);

      await session.commitTransaction();

      const info = {
        username: user.username,
        role: user.role,
        token: token,
        id: user._id.toString(),
      };

      return info;
    } catch (ex) {
      await session.abortTransaction();
      throw new DynamicError(ex);
    } finally {
      await session.endSession();
    }
  }

  async quickVerifyOtp({
    code,
    email,
    type,
    i18n,
  }: {
    code: string;
    email: string;
    type: string;
    i18n: I18nContext;
  }) {
    return this.verifyOtp({ code, email, type, i18n, quickCheck: true });
  }

  async verifyOtp({
    code,
    email,
    quickCheck,
    i18n,
  }: {
    code: string;
    email: string;
    i18n: I18nContext;
    type?: string;
    quickCheck?: boolean;
  }) {
    try {
      const tmpCurrentOtp = await this.optCodeModel.findOne({
        email: email,
        type: otpSignupValidation,
      });

      if (!tmpCurrentOtp) {
        throw new BadRequestException(i18n.t('error.errorNoCode'));
      }

      if (tmpCurrentOtp.code != code) {
        const curInvalid = tmpCurrentOtp.currentValid;

        if (curInvalid > 10) {
          await this.optCodeModel.deleteOne({ _id: tmpCurrentOtp._id });

          throw new BadRequestException(i18n.t('error.errorResendOtpCode'));
        }

        tmpCurrentOtp.currentValid = curInvalid + 1;
        await tmpCurrentOtp.save();
        throw new BadRequestException(i18n.t('error.errorInvalidOtpCode'));
      }

      if (!quickCheck) {
        await this.optCodeModel.deleteOne({ _id: tmpCurrentOtp._id });
      }

      return {
        isValid: true,
      };
    } catch (error) {
      throw new DynamicError(error);
    }
  }

  async signUp({
    i18n,
    clientIp,
    email,
    code,
    type,
    password,
    name,
    fcmToken,
    deviceId,
    platform,
  }: {
    clientIp: string;
    code: string;
    email: string;
    password: string;
    name: string;
    type: string;
    i18n: I18nContext;
    pinCode?: string;
    fcmToken?: string;
    deviceId?: string;
    platform?: string;
  }) {
    const session = await this.connection.startSession();

    let user: UserDocument;
    const result: any = {};
    const clientCountry = detectCountryViaIP(clientIp);

    await this.verifyOtp({ code, email, i18n, type });

    try {
      session.startTransaction();

      const checkUser = await this.userModel
        .findOne({
          username: email,
        })
        .lean();

      if (checkUser) {
        throw new BadRequestException(i18n.t('error.errorUserAlreadyExist'));
      }

      const stripeCustomer = await this.customerStripeService.create({
        email,
      });

      if (!stripeCustomer) {
        throw new BadGatewayException(
          i18n.t('error.errorStripeCreateCustomer'),
        );
      }

      switch (type) {
        case 'parent':
          {
            user = new this.userModel({
              username: email,
              role: UserRole.PARENT,
              password: password,
            });

            await user.save({ session });

            if (fcmToken && deviceId) {
              await new this.appPushTokenModel({
                userId: user._id,
                userType: UserRole.PARENT,
                fcmToken: fcmToken,
                deviceId: deviceId,
                platform: platform,
              }).save({ session });
            }

            const parentData = {
              userId: user._id,
              firstName: name,
              gender: 3,
              email: email,
              country: clientCountry,
              stripeCusId: stripeCustomer.id,
              status: 'active',
            };

            const parent = await new this.parentModel(parentData).save();

            result.name = parent.name;
            result.role = user.role;
            result.email = parent.email;

            console.log('a');
          }
          break;
        case 'educator': {
          break;
        }
        default:
          break;
      }

      await session.commitTransaction();

      result.token = await this.generateToken(user);

      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new DynamicError(error);
    } finally {
      await session.endSession();
    }
  }

  async resetPassword({
    i18n,
    code,
    email,
    password,
  }: {
    code: string;
    email: string;
    password: string;
    type: string;
    i18n: I18nContext;
  }) {
    await this.verifyOtp({ code, email, i18n });

    try {
      const user = await this.userModel.findOne({
        username: email,
      });

      user.password = password;
      await user.save();

      const token = await this.generateToken(user);

      return {
        email: email,
        type: user.role,
        token: token,
      };
    } catch (error) {
      throw new DynamicError(error);
    }
  }
}
