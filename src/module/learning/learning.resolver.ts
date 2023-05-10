import { Created } from './objectType/attackLesson.objectType';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LearningService } from './learning.service';
import { AuthGql } from '../auth/decorator/auth.decorator';
import { UserRole } from 'src/common/enum';
import { LevelCertificate } from './objectType/levelCertificate.objectType';
import { GraphqlCurrentUser } from '../auth/decorator/loggedUser.decorator';
import { LoggedUser } from '../auth/passport/auth.type';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SubmitLesson } from './objectType/submitLesson.objectType';
import { SubmitLessonEnum } from './type/learning.enum';

@Resolver()
export class LearningResolver {
  constructor(private readonly learningService: LearningService) {}

  @Query(() => [LevelCertificate], { nullable: 'items' })
  @AuthGql(UserRole.KID, UserRole.PARENT)
  async levelCertifications(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() user: LoggedUser,
    @Args('lang', { nullable: true }) lang?: string,
  ) {
    console.log('🚀 ~ file: learning.resolver.ts:24 ~ LearningResolver ~ lang:', lang);
    return this.learningService.levelCertifications({ loggedUser: user, i18n });
  }

  @Mutation(() => Created)
  @AuthGql(UserRole.KID)
  async attackLesson(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args('lessonId', { nullable: false })
    lessonId: string,
  ) {
    return this.learningService.attackLesson({ i18n, loggedUser, lessonId });
  }

  @Mutation(() => SubmitLesson)
  @AuthGql(UserRole.KID)
  async submitLesson(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args('lessonId', { nullable: false })
    lessonId: string,
    @Args('type', { type: () => SubmitLessonEnum, nullable: false })
    type: SubmitLessonEnum,
    @Args('questionId', { nullable: true })
    questionId: string,
    @Args('answerKey', { nullable: true })
    answerKey: string,
    @Args('score', { type: () => Int, nullable: true })
    score: number,
  ) {
    return this.learningService.submitLesson({
      i18n,
      loggedUser,
      lessonId,
      type,
      questionId,
      answerKey,
      score,
    });
  }
}
