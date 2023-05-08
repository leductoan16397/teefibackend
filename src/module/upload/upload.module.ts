import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadResolver } from './upload.resolver';
import { AWSModule } from '../aws/aws.module';

@Module({
  imports: [AWSModule],
  controllers: [UploadController],
  providers: [UploadService, UploadResolver],
})
export class UploadModule {}
