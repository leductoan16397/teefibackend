import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ParentService } from './parent.service';
import {
  SuccessObjectType,
  PaymentCardObjectType,
} from './objectTYpe/paymentCard.objectType';
import { UserRole } from 'src/common/enum';
import { AuthGql } from '../auth/decorator/auth.decorator';
import { I18n, I18nContext } from 'nestjs-i18n';
import { GraphqlCurrentUser } from '../auth/decorator/loggedUser.decorator';
import { LoggedUser } from '../auth/passport/auth.type';
import { InvoiceObjectType } from './objectTYpe/invoce.objectType';
import { KidsByManager } from '../kid/objectType/kidsByManager.objectType';
import { MEMBER_TYPE } from 'src/common/constant';
import { BadRequestException, Req } from '@nestjs/common';
import { EnrollObjectType } from './objectTYpe/enroll.objectTYpe';
import { Request } from 'express';

@Resolver()
export class ParentResolver {
  constructor(private readonly parentService: ParentService) {}

  @Query(() => [PaymentCardObjectType])
  @AuthGql(UserRole.PARENT)
  async paymentCards(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() user: LoggedUser,
    @Args('lang', { nullable: true }) lang?: string,
  ) {
    console.log(
      '🚀 ~ file: parent.resolver.ts:30 ~ ParentResolver ~ lang:',
      lang,
    );
    return this.parentService.paymentCards({ loggedUser: user, i18n });
  }

  @Query(() => [InvoiceObjectType])
  @AuthGql(UserRole.PARENT)
  async listInvoice(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() user: LoggedUser,
    @Args('lang', { nullable: true }) lang?: string,
  ) {
    console.log(
      '🚀 ~ file: parent.resolver.ts:44 ~ ParentResolver ~ lang:',
      lang,
    );
    return this.parentService.listInvoice({ loggedUser: user, i18n });
  }

  @Mutation(() => PaymentCardObjectType)
  @AuthGql(UserRole.PARENT)
  async addPaymentCard(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() user: LoggedUser,
    @Args('paymentMethodId', { nullable: false })
    paymentMethodId: string,
  ) {
    return this.parentService.addPaymentCard({
      loggedUser: user,
      i18n,
      paymentMethodId,
    });
  }

  @Mutation(() => SuccessObjectType)
  @AuthGql(UserRole.PARENT)
  async deletePaymentCard(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() user: LoggedUser,
    @Args('_id', { nullable: false })
    _id: string,
  ) {
    return this.parentService.deletePaymentCard({
      loggedUser: user,
      i18n,
      paymentCardId: _id,
    });
  }

  @Mutation(() => PaymentCardObjectType)
  @AuthGql(UserRole.PARENT)
  async updatePrimaryCard(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() user: LoggedUser,
    @Args('_id', { nullable: false })
    _id: string,
  ) {
    return this.parentService.updatePrimaryCard({
      loggedUser: user,
      i18n,
      paymentCardId: _id,
    });
  }

  @Mutation(() => SuccessObjectType)
  @AuthGql(UserRole.PARENT)
  async manualAttachStripeCustomer(@I18n() i18n: I18nContext) {
    return this.parentService.attachStripeCustomer({
      i18n,
    });
  }

  @Mutation(() => KidsByManager)
  @AuthGql(UserRole.PARENT)
  async changeWatchingKid(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args('childId', { nullable: false }) childId: string,
  ) {
    return this.parentService.activeChild({
      loggedUser,
      childId,
      i18n,
    });
  }

  @Mutation(() => EnrollObjectType)
  @AuthGql(UserRole.PARENT)
  async enroll(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args('memberType', { nullable: false }) memberType: string,
    @Args('enrollFor', { nullable: false }) enrollFor: string,
  ) {
    if (!Object.values(MEMBER_TYPE).includes(memberType)) {
      throw new BadRequestException(i18n.t('error.errorMemberTypeNotFound'));
    }
    return this.parentService.enroll({
      i18n,
      loggedUser,
      memberType,
      enrollFor,
    });
  }

  @Mutation(() => SuccessObjectType)
  @AuthGql(UserRole.PARENT)
  async cancelSubscriptionPlan(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args('lang', { nullable: true }) lang?: string,
  ) {
    console.log(
      '🚀 ~ file: parent.resolver.ts:134 ~ ParentResolver ~ lang:',
      lang,
    );
    return this.parentService.cancelSubscriptionPlan({
      i18n,
      loggedUser,
    });
  }

  @Mutation(() => KidsByManager)
  @AuthGql(UserRole.PARENT)
  async updateMembership(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args('memberType', { nullable: false }) memberType: string,
  ) {
    if (!Object.values(MEMBER_TYPE).includes(memberType)) {
      throw new BadRequestException(i18n.t('error.errorMemberTypeNotFound'));
    }
    return this.parentService.updateMembership({
      i18n,
      loggedUser,
      memberType,
    });
  }
}
