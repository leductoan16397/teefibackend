import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';
import { User } from './user.schema';
import { UserRole } from 'src/common/enum';
import { uniqueValidator } from 'src/common/schema.utils';

export type AppPushTokenDocument = HydratedDocument<AppPushToken>;

export type AppPushTokenLeanDoc = AppPushToken & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.APP_PUSH_TOKEN,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class AppPushToken {
  @Prop({
    validate: uniqueValidator,
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    immutable: true,
    ref: User.name,
  })
  userId: Types.ObjectId;

  @Prop({ enum: UserRole })
  userType: UserRole;

  @Prop()
  fcmToken: string;

  @Prop()
  deviceId: string;

  @Prop()
  platform: string;
}

export const AppPushTokenSchema = SchemaFactory.createForClass(AppPushToken);

AppPushTokenSchema.loadClass(AppPushToken);
