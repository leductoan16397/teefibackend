import { Args, Context, ID, Query, Resolver } from '@nestjs/graphql';
import { HomeService } from './home.service';
import { HomeType } from './objectType/home.objectType';
import { Request } from 'express';
import { PrivatePlan } from './objectType/privatePlan.objectType';
import { DeleteUserType } from './objectType/deleteUserType';

@Resolver()
export class HomeResolver {
  constructor(private readonly homeService: HomeService) {}

  @Query(() => HomeType)
  async home(@Args('lang', { nullable: false }) lang: string) {
    console.log('🚀 ~ file: home.resolver.ts:15 ~ HomeResolver ~ home ~ lang:', lang);
    return this.homeService.landingPageData();
  }

  @Query(() => PrivatePlan)
  async privatePlan(
    @Context('req') req: Request,
    @Args('lang', { nullable: false }) lang: string,
    @Args('switchToStandardCurrency', { type: () => ID, nullable: true })
    switchToStandardCurrency?: string,
  ) {
    console.log('🚀 ~ file: home.resolver.ts:26 ~ HomeResolver ~ lang:', lang);
    const clientIp = req.ip;
    return this.homeService.privatePlan({ clientIp, switchToStandardCurrency });
  }

  @Query(() => DeleteUserType)
  async initDeleteUser(@Args('lang', { nullable: true }) lang?: string) {
    console.log('🚀 ~ file: home.resolver.ts:35 ~ HomeResolver ~ initDeleteUser ~ lang:', lang);
    return this.homeService.deleteUserReasons();
  }
}
