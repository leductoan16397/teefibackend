import { Args, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AuthGql } from '../auth/decorator/auth.decorator';
import { GraphqlCurrentUser } from '../auth/decorator/loggedUser.decorator';
import { LoggedUser } from '../auth/passport/auth.type';
import { LoggedUserType } from './graphQlObjectType/user.ObjectType';
import { UserRole } from 'src/common/enum';
import {
  IsDeletedObjectType,
  IsUpdatedObjectType,
  UniqueObjectType,
} from './graphQlObjectType/common.objectType';
import { GraphQLURL } from '../upload/scalar/url.scalar';

@Resolver(() => LoggedUserType)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => LoggedUserType)
  @AuthGql()
  me(
    @GraphqlCurrentUser() user: LoggedUser,
    @I18n() i18n: I18nContext,
    @Args('lang', { nullable: true }) lang?: string,
  ) {
    console.log('🚀 ~ file: user.resolver.ts:27 ~  UserResolver ~ lang:', lang);
    return this.userService.getLoggedUserInfo({ loggedUser: user, i18n });
  }

  @ResolveField()
  async paymentCard(@GraphqlCurrentUser() user: LoggedUser) {
    return this.userService.getPaymentCard({ loggedUser: user });
  }

  @Query(() => [String])
  @AuthGql(UserRole.KID, UserRole.PARENT)
  async dashboardAlert(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() user: LoggedUser,
    @Args('lang', { nullable: true }) lang?: string,
  ) {
    console.log('🚀 ~ file: user.resolver.ts:43 ~ UserResolver ~ lang:', lang);
    return this.userService.dashboardAlert({ loggedUser: user, i18n });
  }

  @Mutation(() => UniqueObjectType)
  async checkUsernameUnique(
    @I18n() i18n: I18nContext,
    @Args('username', { nullable: false }) username: string,
  ) {
    return this.userService.checkUsernameUnique({ i18n, username });
  }

  @Mutation(() => LoggedUserType)
  @AuthGql(UserRole.KID, UserRole.PARENT)
  async updateMe(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args('firstName', { nullable: true }) firstName?: string,
    @Args('lastName', { nullable: true }) lastName?: string,
    @Args('address', { nullable: true }) address?: string,
    @Args('avatar', { type: () => GraphQLURL, nullable: true }) avatar?: string,
  ) {
    return this.userService.updateMe({
      i18n,
      loggedUser,
      firstName,
      lastName,
      address,
      avatar,
    });
  }

  @Mutation(() => IsDeletedObjectType)
  @AuthGql(UserRole.PARENT)
  async deleteSelfAccount(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args('reason', { nullable: false }) reason: string,
    @Args('adviseUs', { nullable: false }) adviseUs: string,
  ) {
    return this.userService.deleteSelfAccount({
      i18n,
      loggedUser,
      reason,
      adviseUs,
    });
  }

  @Mutation(() => IsUpdatedObjectType)
  @AuthGql(UserRole.KID, UserRole.PARENT)
  async selfChangePassword(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args('oldPassword', { nullable: false }) oldPassword: string,
    @Args('newPassword', { nullable: false }) newPassword: string,
  ) {
    return this.userService.selfChangePassword({
      i18n,
      loggedUser,
      oldPassword,
      newPassword,
    });
  }
}
