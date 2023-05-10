import { LogDBService } from './log.abstract';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LOG_ACTION } from 'src/common/constant';
import { Injectable } from '@nestjs/common';
import { EventLog } from '../../schema/eventLogs.schema';
import { Parent } from '../../schema/parent.schema';

@Injectable({})
export class ParentLogService extends LogDBService {
  constructor(
    @InjectModel(EventLog.name)
    protected readonly EventLogModel: Model<EventLog>,
  ) {
    super(EventLogModel);
    this.modelName = Parent.name;
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
      //compare email
      result = this.compareChangedData(self, docToUpdate, 'email', result);
      //compare address
      result = this.compareChangedData(self, docToUpdate, 'address', result);
      //compare pin gender
      result = this.compareChangedData(self, docToUpdate, 'gender', result);
      //compare pin avatar
      result = this.compareChangedData(self, docToUpdate, 'avatar', result);
      //compare pin birthday
      result = this.compareChangedData(self, docToUpdate, 'birthday', result);
      //compare pin country
      result = this.compareChangedData(self, docToUpdate, 'country', result);
      //compare pin stripeCusId
      result = this.compareChangedData(self, docToUpdate, 'stripeCusId', result);
      //compare pin user
      result = this.compareChangedData(self, docToUpdate, 'user', result);
      //compare pin kids
      result = this.compareChangedData(self, docToUpdate, 'kids', result);
      //compare pin watchingKid
      result = this.compareChangedData(self, docToUpdate, 'watchingKid', result);
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
    const { createdBy, createdByUserType, session, enableLog } = options;

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
