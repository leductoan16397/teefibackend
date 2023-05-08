import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAME } from 'src/common/constant';

export type EventLogDocument = HydratedDocument<EventLog>;

export type EventLogLeanDoc = EventLog & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.EVENT_LOG,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class EventLog {
  @Prop({})
  modelName: string;

  @Prop({})
  action: string;

  @Prop({})
  subAction?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
  })
  dataId: Types.ObjectId;

  @Prop({ type: Object })
  dataChanged: any;

  @Prop({})
  note?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME.USER,
    immutable: true,
  })
  createdBy: Types.ObjectId;

  @Prop({})
  createdByUserType: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const EventLogSchema = SchemaFactory.createForClass(EventLog);

EventLogSchema.loadClass(EventLog);
