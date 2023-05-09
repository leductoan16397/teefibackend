import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose, {
  CallbackWithoutResultAndOptionalError,
  HydratedDocument,
  SaveOptions,
  Types,
} from 'mongoose';
import { User } from './user.schema';
import { COLLECTION_NAME } from 'src/common/constant';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { ParentLogService } from '../log/service/parentLog.service';

export type ParentDocument = HydratedDocument<Parent>;

export type ParentLeanDoc = Parent & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.PARENT,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Parent {
  @Prop({})
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  address?: string;

  @Prop()
  gender?: string;

  @Prop({
    default:
      'https://d2csac8bc0t9gj.cloudfront.net/publics/students/parent-default-avatar.png',
  })
  avatar?: string;

  @Prop()
  birthday?: Date;

  @Prop({
    default: 'vn',
  })
  country?: string;

  @Prop()
  memberType?: string;

  @Prop()
  stripeCusId?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME.USER,
    immutable: true,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    ref: COLLECTION_NAME.KID,
    type: [mongoose.Schema.Types.ObjectId],
  })
  kidIds: Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME.KID,
  })
  watchingKidId: Types.ObjectId;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Type(() => User)
  userInfo?: User;

  name?: string;
}

export const ParentSchema = SchemaFactory.createForClass(Parent);

ParentSchema.virtual('userInfo', {
  ref: COLLECTION_NAME.USER,
  localField: 'userId',
  foreignField: '_id',
});

ParentSchema.virtual('name').get(function () {
  this.firstName;
});

ParentSchema.pre('deleteOne', async function (next) {
  console.log('hook remove >>>>');

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const parentLogService = appContext.get(ParentLogService);

  await parentLogService.doRemove({ self: this });

  return next();
});

ParentSchema.pre('findOneAndUpdate', async function (next) {
  console.log('hook findOneAndUpdate >>>>');

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const parentLogService = appContext.get(ParentLogService);

  await parentLogService.doUpdate({ self: this });
  return next();
});

ParentSchema.pre(
  'save',
  async function (
    next: CallbackWithoutResultAndOptionalError,
    options: SaveOptions,
  ) {
    console.log('hook create >>>>');

    const appContext = await NestFactory.createApplicationContext(AppModule, {
      logger: false,
    });
    const parentLogService = appContext.get(ParentLogService);

    const self: any = this as any;

    await parentLogService.doCreate({ self, options });
    return next();
  },
);
