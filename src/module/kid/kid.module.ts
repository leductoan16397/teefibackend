import { Module } from '@nestjs/common';
import { KidResolver } from './kid.resolver';
import { KidService } from './kid.service';
import { LearningModule } from '../learning/learning.module';

@Module({
  imports: [LearningModule],
  providers: [KidResolver, KidService],
  exports: [KidService],
})
export class KidModule {}
