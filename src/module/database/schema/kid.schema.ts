import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { CallbackWithoutResultAndOptionalError, HydratedDocument, SaveOptions, Types } from 'mongoose';
import { User } from './user.schema';
import { Type } from 'class-transformer';
import { Parent } from './parent.schema';
import { COLLECTION_NAME } from 'src/common/constant';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { KidLogService } from '../log/service/kidLog.service';
import { convertNumberToFloat } from 'src/common/utils';

export type KidDocument = HydratedDocument<Kid>;

export type KidLeanDoc = Kid & {
  _id: Types.ObjectId;
};

@Schema({ _id: false })
class Asset {
  @Prop({})
  ratio: number;

  @Prop({
    default: 0,
    set: convertNumberToFloat,
  })
  balance: number;
}

const AssetSchema = SchemaFactory.createForClass(Asset);

@Schema({ _id: false })
class KidAsset {
  @Prop({
    type: AssetSchema,
    default: {
      ratio: 0.3,
    },
  })
  investment: Asset;

  @Prop({
    type: AssetSchema,
    default: {
      ratio: 0.6,
    },
  })
  spending: Asset;

  @Prop({
    type: AssetSchema,
    default: {
      ratio: 0.1,
    },
  })
  sharing: Asset;
}

const KidAssetSchema = SchemaFactory.createForClass(KidAsset);

@Schema({
  collection: COLLECTION_NAME.KID,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Kid {
  @Prop({})
  firstName?: string;

  @Prop({})
  lastName?: string;

  @Prop({})
  gender?: string;

  @Prop({
    default: 'https://d2csac8bc0t9gj.cloudfront.net/publics/students/default-avatar.png',
  })
  avatar?: string;

  @Prop({})
  memberType?: string;

  @Prop({})
  address?: string;

  @Prop({})
  country?: string;

  @Prop({})
  birthday?: Date;

  @Prop({ required: true })
  name: string;

  @Prop({
    default: 0,
    set: (value: number) => {
      const float = parseFloat(value.toFixed(2));
      return float;
    },
  })
  balance: number;

  @Prop({
    type: KidAssetSchema,
    default: {},
  })
  asset: KidAsset;

  @Prop({
    default: false,
  })
  isDeleted: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    immutable: true,
    ref: COLLECTION_NAME.PARENT,
  })
  parentId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME.USER,
    required: true,
    immutable: true,
  })
  userId: Types.ObjectId;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Type(() => User)
  userInfo?: User;

  @Type(() => Parent)
  parentInfo?: Parent;
}

export const KidSchema = SchemaFactory.createForClass(Kid);

KidSchema.virtual('userInfo', {
  ref: 'users',
  localField: 'userId',
  foreignField: '_id',
});

KidSchema.virtual('parentInfo', {
  ref: 'parents',
  localField: '_id',
  foreignField: 'userId',
});

KidSchema.pre('deleteOne', async function (next) {
  console.log('hook remove >>>>');

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const kidLogService = appContext.get(KidLogService);

  await kidLogService.doRemove({ self: this });

  return next();
});

KidSchema.pre('findOneAndUpdate', async function (next) {
  console.log('hook findOneAndUpdate >>>>');

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const kidLogService = appContext.get(KidLogService);

  await kidLogService.doUpdate({ self: this });
  return next();
});

KidSchema.pre('save', async function (next: CallbackWithoutResultAndOptionalError, options: SaveOptions) {
  console.log('hook create >>>>');

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const kidLogService = appContext.get(KidLogService);

  const self: any = this as any;
  await kidLogService.doCreate({ self, options });
  return next();
});
