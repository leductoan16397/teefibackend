import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResolver } from './home.resolver';

@Module({
  providers: [HomeResolver, HomeService],
})
export class HomeModule {}
