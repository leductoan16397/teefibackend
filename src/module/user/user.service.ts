import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Connection, Model } from 'mongoose';
import { I18nContext } from 'nestjs-i18n';
import { UserRole } from 'src/common/enum';
import { LoggedUser } from '../auth/passport/auth.type';
import { EnrollHistory } from '../database/schema/enrollHistory.schema';
import { Kid, KidDocument } from '../database/schema/kid.schema';
import { Parent, ParentDocument } from '../database/schema/parent.schema';
import { User } from '../database/schema/user.schema';
import { LoggedUserType } from './graphQlObjectType/user.ObjectType';
import { PaymentCard } from '../database/schema/paymentCard.schema';
import { Constant } from '../database/schema/constant.schema';
import { S3Service } from '../aws/s3.service';
import { Feedback } from '../database/schema/feedback.schema';
import { ENROLL_STATUS, PREFIX_DELETE_USER } from 'src/common/constant';
import { SubscriptionStripeService } from '../payment/stripe/service/subscription.stripe.service';
import { DynamicError } from 'src/common/error';

@Injectable()
export class UserService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Kid.name) private readonly kidModel: Model<Kid>,
    @InjectModel(Parent.name) private readonly parentModel: Model<Parent>,
    @InjectModel(Constant.name) private readonly constantModel: Model<Constant>,
    @InjectModel(Feedback.name) private readonly feedbackModel: Model<Feedback>,

    @InjectModel(PaymentCard.name)
    private readonly paymentCardModel: Model<PaymentCard>,

    @InjectModel(EnrollHistory.name)
    private readonly enrollHistoryModel: Model<EnrollHistory>,

    private readonly s3Service: S3Service,
    private readonly subscriptionStripeService: SubscriptionStripeService,
  ) {}

  async getLoggedUserInfo({ loggedUser, i18n }: { loggedUser: LoggedUser; i18n: I18nContext }) {
    try {
      let userInfo: any;

      const user = await this.userModel
        .findOne({
          _id: loggedUser.id,
          username: loggedUser.username,
          isDeleted: false,
        })
        .lean();
      if (!user) {
        throw new BadRequestException(i18n.t('error.errorUserExist'));
      }

      switch (user.role) {
        case UserRole.KID: {
          userInfo = await this.kidModel
            .findOne({
              isDeleted: false,
              userId: user._id,
            })
            .lean();

          if (!userInfo) {
            throw new BadRequestException(i18n.t('error.userNotFound'));
          }

          const enrollHis = await this.enrollHistoryModel.findOne({ kidId: userInfo._id }, { isRecurring: 1 }).lean();

          userInfo.isRecurring = enrollHis?.isRecurring || 0;
          break;
        }
        case 'parent': {
          userInfo = await this.parentModel
            .findOne({
              isDeleted: false,
              userId: user._id,
            })
            .lean();

          if (!userInfo) {
            throw new Error('user not exist');
          }

          const paymentCard = await this.paymentCardModel
            .findOne({
              userId: user._id,
              userType: UserRole.PARENT,
              isPrimary: 1,
            })
            .lean();

          if (paymentCard) {
            userInfo.paymentCard = {
              paymentMethodId: paymentCard.paymentMethodId,
              memberType: paymentCard.memberType,
            };
          }
          break;
        }

        default:
          break;
      }

      const result: Omit<LoggedUserType, 'paymentCard'> = {
        _id: user._id.toString(),
        id: user._id.toString(),
        name: userInfo.name,
        username: user.username,
        avatar: userInfo.avatar,
        status: user.status,
        email: userInfo.email || user.username,
        role: user.role,
        address: userInfo.address,
        country: userInfo.country,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        gender: userInfo.gender,
        memberType: userInfo.memberType,
        birthday: userInfo.birthday ? moment(userInfo.birthday).format('YYYY-MM-DD') : undefined,
        isRecurring: userInfo.isRecurring,
        // TODO: get paymentCard for parent and educator
        // paymentCard: userInfo.paymentCard,
      };
      return result;
    } catch (error) {
      throw new DynamicError(error);
    }
  }

  async getPaymentCard({ loggedUser }: { loggedUser: LoggedUser }) {
    try {
      switch (loggedUser.role) {
        case UserRole.PARENT: {
          const paymentCard = await this.paymentCardModel
            .findOne({
              userId: loggedUser.id,
              userType: UserRole.PARENT,
              isPrimary: 1,
            })
            .lean();

          if (!paymentCard) {
            return {};
          }

          return {
            paymentMethodId: paymentCard.paymentMethodId,
            memberType: paymentCard.memberType,
          };
        }
        default:
          return {};
      }
    } catch (error) {
      throw new DynamicError(error);
    }
  }

  async dashboardAlert({ loggedUser, i18n }: { loggedUser: LoggedUser; i18n: I18nContext }) {
    try {
      let dashboardAlert;
      switch (loggedUser.role) {
        case 'parent': {
          dashboardAlert = await this.constantModel.findOne({
            key: 'parentDashboardAlert',
          });
          if (!dashboardAlert) {
            return [];
          }

          const { value } = dashboardAlert;

          if (!value.length) {
            return [];
          }

          const randomInt = Math.floor(Math.random() * (value.length - 0 + 1)) + 0;

          const newMess = value.slice(0, randomInt);

          value.splice(0, randomInt);

          const messAfter = [...value, ...newMess];

          return messAfter;

          break;
        }
        case 'kid': {
          dashboardAlert = await this.constantModel.findOne({
            key: 'kidDashboardAlert',
          });
          if (!dashboardAlert) {
            return [];
          }

          const { value } = dashboardAlert;

          if (!value) {
            return [];
          }

          // TODO: implement by user status active|inactive

          const kid = await this.kidModel.findOne({ userId: loggedUser.id });
          const enroll = await this.enrollHistoryModel
            .findOne({ kidId: kid._id })
            .sort({ updatedAt: -1, createdAt: -1 });
          const expireTime = enroll?.expireTime;

          if (expireTime > new Date()) {
            return [value.subscribed];
          }

          return [value.unSubscribed];

          break;
        }
        default:
          return [];
          break;
      }
    } catch (error) {
      console.log(error.message);
      throw new DynamicError(error);
    }
  }

  async checkUsernameUnique({ i18n, username }: { i18n: I18nContext; username: string }) {
    try {
      const checkExist = await this.userModel.countDocuments({
        username: username.toLowerCase().trim(),
        isDeleted: false,
      });

      return {
        isUnique: checkExist ? 0 : 1,
      };
    } catch (ex) {
      throw new DynamicError(ex);
    }
  }

  async updateMe({
    i18n,
    loggedUser,
    firstName,
    lastName,
    address,
    avatar,
  }: {
    loggedUser: LoggedUser;
    i18n: I18nContext;
    firstName?: string;
    lastName?: string;
    address?: string;
    avatar?: string;
  }) {
    try {
      let st: KidDocument | ParentDocument;

      if (loggedUser.role === UserRole.KID) {
        st = await this.kidModel.findOne({ userId: loggedUser.id });
      } else {
        st = await this.parentModel.findOne({ userId: loggedUser.id });
      }

      if (firstName) {
        st.firstName = firstName;
      }

      if (lastName) {
        st.lastName = lastName;
      }

      if (address) {
        st.address = address;
      }

      let oldAvatar: string;
      if (avatar) {
        if (st.avatar !== avatar) {
          oldAvatar = st.avatar;
          st.avatar = avatar;
        }
      }

      await st.save();
      this.removeOldAvatar(oldAvatar);

      return await this.getLoggedUserInfo({ loggedUser, i18n });
    } catch (ex) {
      console.log(ex.message);
      throw new DynamicError(ex);
    }
  }

  removeOldAvatar(oldAvatar: string) {
    if (typeof oldAvatar !== 'string' || oldAvatar.includes('publics/students')) {
      return;
    }

    const key = oldAvatar.split('cloudfront.net/')[1];

    return this.s3Service.deleteS3Object({
      bucket: process.env.AWS_BUCKET,
      key,
    });
  }

  async deleteSelfAccount({
    i18n,
    loggedUser,
    reason,
    adviseUs,
  }: {
    loggedUser: LoggedUser;
    i18n: I18nContext;
    adviseUs: string;
    reason: string;
  }) {
    const session = await this.connection.startSession();
    const parent = await this.parentModel.findOne({ userId: loggedUser.id });
    try {
      session.startTransaction();
      await new this.feedbackModel({
        userId: loggedUser.id,
        userType: UserRole.PARENT,
        value: {
          reason: reason,
          adviseUs: adviseUs,
        },
      }).save({ session });

      await this.userModel.findOneAndUpdate(
        {
          _id: loggedUser.id,
        },
        {
          username: `${PREFIX_DELETE_USER}-${loggedUser.username}`,
          isDeleted: true,
        },
        {
          session,
          multi: true,
        },
      );

      await this.parentModel.findOneAndUpdate(
        {
          _id: parent._id,
        },
        {
          name: `${PREFIX_DELETE_USER}-${parent.name}`,
          email: `${PREFIX_DELETE_USER}-${parent.email}`,
          isDeleted: true,
        },
        {
          session,
          multi: true,
        },
      );
      const children = await this.kidModel.find({
        parentId: parent._id,
      });
      if (children) {
        for (const i in children) {
          children[i].name = `${PREFIX_DELETE_USER}-${children[i].name}`;
          children[i].isDeleted = true;
          await children[i].save();

          const enrollHistory = await this.enrollHistoryModel
            .findOne({
              parentId: parent._id,
              kidId: children[i]._id,
            })
            .session(session);

          if (!enrollHistory) {
            continue;
          }
          await this.subscriptionStripeService.cancel(enrollHistory.stripeSubscriptionId);

          enrollHistory.status = ENROLL_STATUS.cancel;
        }
      }

      await session.commitTransaction();
      return {
        isDeleted: true,
      };
    } catch (ex) {
      await session.abortTransaction();
      console.log(ex.message);
      throw new DynamicError(ex);
    } finally {
      await session.endSession();
    }
  }

  async selfChangePassword({
    i18n,
    loggedUser,
    oldPassword,
    newPassword,
  }: {
    loggedUser: LoggedUser;
    i18n: I18nContext;
    oldPassword: string;
    newPassword: string;
  }) {
    try {
      const u = await this.userModel
        .findOne({
          _id: loggedUser.id,
        })
        .select('+hashPassword +salt');

      const verifyPassword = await u.verifyPassword(oldPassword);

      if (!verifyPassword) {
        throw new BadRequestException(i18n.t('error.errorOldPasswordInvalid'));
      }

      u.password = newPassword;

      await u.save();

      return {
        isUpdated: true,
      };
    } catch (ex) {
      throw new DynamicError(ex);
    }
  }
}
