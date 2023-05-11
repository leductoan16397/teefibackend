import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CallbackWithoutResultAndOptionalError, HydratedDocument, Model, SaveOptions, Types } from 'mongoose';
import { UserRole, UserStatus } from 'src/common/enum';
import { encodePassword, generateSalt } from 'src/common/utils';
import { Kid } from './kid.schema';
import { Parent } from './parent.schema';
import { COLLECTION_NAME } from 'src/common/constant';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { UserLogService } from 'src/module/database/log/service/userLog.service';
import { uniqueValidator } from 'src/common/schema.utils';

export type UserDocument = HydratedDocument<User>;

export type UserLeanDoc = User & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.USER,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class User {
  @Prop({
    required: true,
    immutable: true,
    index: 'asc',
    validate: uniqueValidator,
  })
  username: string;

  @Prop({
    select: false,
  })
  hashPassword?: string;

  @Prop({
    select: false,
  })
  salt?: string;

  @Prop({
    default: UserStatus.ACTIVE,
    enum: UserStatus,
  })
  status: UserStatus;

  @Prop({
    enum: UserRole,
    required: true,
  })
  role: UserRole;

  @Prop({
    default: false,
  })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  async verifyPassword(password: string) {
    return password && this.hashPassword === (await encodePassword(password, this.salt));
  }

  static async checkUsernameUnique(username: string) {
    const checkUnique = await (this as unknown as Model<User>).findOne({ username }).lean();

    return checkUnique ? false : true;
  }

  kidInfo?: Kid;
  parentInfo?: Parent;
  password?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

UserSchema.virtual('password').set(async function (password: string) {
  if (!this.salt) this.salt = generateSalt();
  this.hashPassword = await encodePassword(password, this.salt);
});

UserSchema.virtual('kidInfo', {
  ref: COLLECTION_NAME.KID,
  localField: '_id',
  foreignField: 'userId',
});

UserSchema.virtual('parentInfo', {
  ref: COLLECTION_NAME.PARENT,
  localField: '_id',
  foreignField: 'userId',
});

UserSchema.pre('findOneAndUpdate', async function (next) {
  console.log('hook findOneAndUpdate >>>>');

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const userLogService = appContext.get(UserLogService);
  await userLogService.doUpdate({ self: this });
  await appContext.close();

  return next();
});

UserSchema.pre('save', async function (next: CallbackWithoutResultAndOptionalError, options: SaveOptions) {
  console.log('hook create >>>>');

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const userLogService = appContext.get(UserLogService);

  const self: any = this as any;

  await userLogService.doCreate({ self, options });
  await appContext.close();

  return next();
});

UserSchema.pre('deleteOne', { document: true, query: true }, async function (next) {
  console.log('hook remove >>>>');

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const userLogService = appContext.get(UserLogService);
  await userLogService.doRemove({ self: this });
  await appContext.close();

  return next();
});
