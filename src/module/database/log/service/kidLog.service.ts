import { LogDBService } from './log.abstract';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LOG_ACTION } from 'src/common/constant';
import { Injectable } from '@nestjs/common';
import { EventLog } from '../../schema/eventLogs.schema';
import { Kid } from '../../schema/kid.schema';

@Injectable({})
export class KidLogService extends LogDBService {
  constructor(
    @InjectModel(EventLog.name)
    protected readonly EventLogModel: Model<EventLog>,
  ) {
    super(EventLogModel);
    this.modelName = Kid.name;
  }

  async doUpdate(params) {
    const self = params.self;
    const { createdBy, createdByUserType, session, enableLog } = self.options;
    console.log('enableLog', enableLog);

    let result = {};
    try {
      const docToUpdate = await self.model.findOne(self.getQuery());
      //compare firstName
      result = this.compareChangedData(self, docToUpdate, 'firstName', result);
      //compare lastName
      result = this.compareChangedData(self, docToUpdate, 'lastName', result);
      //compare gender
      result = this.compareChangedData(self, docToUpdate, 'gender', result);
      //compare avatar
      result = this.compareChangedData(self, docToUpdate, 'avatar', result);
      //compare birthday
      result = this.compareChangedData(self, docToUpdate, 'birthday', result);
      //compare name
      result = this.compareChangedData(self, docToUpdate, 'name', result);
      //compare activeInvoiceId
      result = this.compareChangedData(self, docToUpdate, 'activeInvoiceId', result);
      //compare address
      result = this.compareChangedData(self, docToUpdate, 'address', result);
      //compare country
      result = this.compareChangedData(self, docToUpdate, 'country', result);
      //compare parent
      result = this.compareChangedData(self, docToUpdate, 'parent', result);
      //compare classes
      result = this.compareChangedData(self, docToUpdate, 'classes', result);
      //compare user
      result = this.compareChangedData(self, docToUpdate, 'user', result);
      //compare balance
      result = this.compareChangedData(self, docToUpdate, 'balance', result);
      //compare pin isDeleted
      result = this.compareChangedData(self, docToUpdate, 'isDeleted', result);

      await this.logForUpdate({
        params: {
          compareResult: result,
          docToUpdate: docToUpdate,
          createdBy: createdBy,
          createdByUserType: createdByUserType,
          action: LOG_ACTION.update,
        },
        session,
      });
    } catch (err) {
      console.error('err >>>>', err);
    }
  }

  async doCreate({ options, self }: { self; options }) {
    const { createdBy, createdByUserType, session } = options;

    try {
      await this.logForCreate({
        params: {
          docToCreate: self,
          createdBy: createdBy,
          createdByUserType: createdByUserType,
          action: LOG_ACTION.create,
        },
        session,
      });
    } catch (err) {
      console.error('err >>>>', err);
    }
  }

  async doRemove(params) {
    const self = params.self;
    const { createdBy, createdByUserType, session, doc } = self.options;
    console.log('createdBy, createdByUserType', createdBy, createdByUserType);
    try {
      await this.logForRemove({
        params: {
          docToRemove: doc,
          createdBy: createdBy,
          createdByUserType: createdByUserType,
          action: LOG_ACTION.remove,
        },
        session,
      });
    } catch (err) {
      console.error('err >>>>', err);
    }
  }
}
