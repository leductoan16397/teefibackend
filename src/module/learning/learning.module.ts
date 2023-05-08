import { Module } from '@nestjs/common';
import { LearningResolver } from './learning.resolver';
import { LearningService } from './learning.service';

@Module({
  providers: [LearningResolver, LearningService],
  exports: [LearningService],
})
export class LearningModule {}
