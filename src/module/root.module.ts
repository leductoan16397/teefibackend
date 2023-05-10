import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { KidModule } from './kid/kid.module';
import { ParentModule } from './parent/parent.module';
import { LearningModule } from './learning/learning.module';
import { UploadModule } from './upload/upload.module';
import { HomeModule } from './home/home.module';

@Module({
  imports: [AuthModule, DatabaseModule, HomeModule, UserModule, KidModule, ParentModule, LearningModule, UploadModule],
})
export class RootModule {}
