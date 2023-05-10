import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGql } from '../auth/decorator/auth.decorator';
import { UserRole } from 'src/common/enum';
import { KidService } from './kid.service';
import { I18n, I18nContext } from 'nestjs-i18n';
import { GraphqlCurrentUser } from '../auth/decorator/loggedUser.decorator';
import { LoggedUser } from '../auth/passport/auth.type';
import { KidsByManager } from './objectType/kidsByManager.objectType';
import { LearningDashboard } from './objectType/learningDashboard.objectType';
import { LessonData } from './objectType/listLesson.objectType';
import { SuccessObjectType, UpdatedObjectType } from '../parent/objectTYpe/paymentCard.objectType';
import { KidObjectType } from './objectType/kid.objectType';
import { LessonInfo } from './objectType/lessonInfo.objectype';

@Resolver()
export class KidResolver {
  constructor(private readonly kidService: KidService) {}

  @Query(() => KidsByManager)
  @AuthGql(UserRole.PARENT)
  async kids(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() user: LoggedUser,
    @Args('lang', { nullable: true }) lang?: string,
  ) {
    console.log('🚀 ~ file: kid.resolver.ts:28 ~ KidResolver ~ lang:', lang);
    return this.kidService.kidsByManager({ user, i18n });
  }

  @Query(() => [String])
  @AuthGql(UserRole.KID)
  async dailyInspiring(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() user: LoggedUser,
    @Args('lang', { nullable: true }) lang?: string,
  ) {
    console.log('🚀 ~ file: kid.resolver.ts:37 ~ KidResolver ~ lang:', lang);
    return this.kidService.dailyInspiring({ loggedUser: user, i18n });
  }

  @Query(() => LearningDashboard)
  @AuthGql(UserRole.KID, UserRole.PARENT)
  async learningDashboard(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() user: LoggedUser,
    @Args('lang', { nullable: false }) lang: string,
  ) {
    console.log('🚀 ~ file: kid.resolver.ts:46 ~ KidResolver ~ lang:', lang);
    return this.kidService.learningDashboard({ loggedUser: user, i18n });
  }

  @Query(() => LessonData)
  @AuthGql(UserRole.KID, UserRole.PARENT)
  async listLessons(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() user: LoggedUser,
    @Args('level', {})
    level: string,
    @Args('levelId', { nullable: true })
    levelId?: string,
    @Args('lang', { nullable: true }) lang?: string,
  ) {
    console.log('🚀 ~ file: kid.resolver.ts:61 ~ KidResolver ~ lang:', lang);
    return this.kidService.listLessons({
      loggedUser: user,
      i18n,
      level,
      levelId,
    });
  }

  @Query(() => LessonInfo)
  @AuthGql(UserRole.KID)
  async kidLessonInfo(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() user: LoggedUser,
    @Args('lessonId', { nullable: false })
    lessonId: string,
  ) {
    return this.kidService.kidLessonInfo({
      loggedUser: user,
      i18n,
      lessonId,
    });
  }

  @Mutation(() => UpdatedObjectType)
  @AuthGql(UserRole.PARENT)
  async changePasswordChild(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args('newPassword', { nullable: false })
    newPassword: string,
    @Args('kidId', { nullable: false })
    kidId: string,
  ) {
    return this.kidService.changePasswordByManager({
      i18n,
      loggedUser,
      newPassword,
      kidId,
    });
  }

  @Mutation(() => KidObjectType)
  @AuthGql(UserRole.PARENT)
  async updateChild(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args('_id', { nullable: false })
    kidId: string,
    @Args('name', { nullable: true })
    name?: string,
    @Args('birthday', { nullable: true })
    birthday?: string,
    @Args('password', { nullable: true })
    password?: string,
    @Args('avatar', { nullable: true })
    avatar?: string,
  ) {
    return this.kidService.update({
      i18n,
      loggedUser,
      name,
      kidId,
      birthday,
      password,
      avatar,
    });
  }

  @Mutation(() => SuccessObjectType)
  @AuthGql(UserRole.PARENT)
  async deleteChild(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args('_id', { nullable: false })
    kidId: string,
  ) {
    return this.kidService.delete({
      kidId,
      i18n,
      loggedUser,
    });
  }

  @Mutation(() => KidObjectType)
  @AuthGql(UserRole.PARENT)
  async createChild(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args('name', { nullable: false }) name: string,
    @Args('birthday', { nullable: false }) birthday: string,
    @Args('username', { nullable: false }) username: string,
    @Args('password', { nullable: false }) password: string,
    @Args('avatar', { nullable: true }) avatar?: string,
    @Args('lang', { nullable: true }) lang?: string,
  ) {
    console.log('🚀 ~ file: kid.resolver.ts:155 ~ KidResolver ~ lang:', lang);
    return this.kidService.create({
      i18n,
      loggedUser,
      name,
      birthday,
      username: username.toLowerCase().trim(),
      password,
      avatar,
    });
  }
}
