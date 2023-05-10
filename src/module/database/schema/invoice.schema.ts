import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { CallbackWithoutResultAndOptionalError, HydratedDocument, Model, SaveOptions, Types } from 'mongoose';
import { COLLECTION_NAME, ENV, INVOICE_STATUS, INVOICE_TYPE } from 'src/common/constant';
import * as moment from 'moment';
import { InvoiceLogService } from '../log/service/invoiceLog.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';

export type InvoiceDocument = HydratedDocument<Invoice>;

export type InvoiceLeanDoc = Invoice & {
  _id: Types.ObjectId;
};

@Schema({
  collection: COLLECTION_NAME.INVOICE,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Invoice extends Model {
  @Prop({})
  aliasId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME.PARENT,
  })
  parentId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME.KID,
  })
  kidId: Types.ObjectId;

  @Prop({})
  provider: string;

  @Prop({})
  paymentMethod: string;

  @Prop({ enum: INVOICE_STATUS, default: INVOICE_STATUS.processing })
  status: INVOICE_STATUS;

  @Prop({ default: 0 })
  amount: number;

  @Prop({ default: '$' })
  currency: string;

  @Prop({})
  title: string;

  @Prop({})
  partnerTransactionId: string;

  @Prop({})
  partnerInvoiceId: string;

  @Prop({})
  type: INVOICE_TYPE;

  @Prop({})
  signature: string;

  @Prop({ type: Object })
  extraData: any;

  @Prop({})
  failReason: string;

  @Prop({ default: 'desktopWeb' })
  deviceInfo: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  static prefix(type?: string) {
    if (process.env.NODE_ENV !== ENV.prod) {
      return `${process.env.NODE_ENV.toUpperCase()}-TF`;
    }
    return 'TF';
  }

  static async generateTrialAliasId() {
    const prefix = `${this.prefix('trial')}${moment().format('YYYY')}`;

    let number = await this.countDocuments();
    number += 1;
    return `${prefix}-${number}`;
  }

  static async generatePaidAliasId() {
    const prefix = `${this.prefix('paid')}${moment().format('YYYY')}`;

    let number = await this.countDocuments();
    number += 1;
    return `${prefix}-${number}`;
  }
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.loadClass(Invoice);

InvoiceSchema.pre('deleteOne', async function (next) {
  console.log('hook remove >>>>');

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const invoiceLogService = appContext.get(InvoiceLogService);

  await invoiceLogService.doRemove({ self: this });

  return next();
});

InvoiceSchema.pre('findOneAndUpdate', async function (next) {
  console.log('hook findOneAndUpdate >>>>');

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const invoiceLogService = appContext.get(InvoiceLogService);

  await invoiceLogService.doUpdate({ self: this });

  return next();
});

InvoiceSchema.pre('save', async function (next: CallbackWithoutResultAndOptionalError, options: SaveOptions) {
  console.log('hook create >>>>');

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const invoiceLogService = appContext.get(InvoiceLogService);

  const self: any = this as any;
  await invoiceLogService.doCreate({ self, options });

  return next();
});
