import { LogDBService } from './log.abstract';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LOG_ACTION } from 'src/common/constant';
import { Injectable } from '@nestjs/common';
import { EventLog } from '../../schema/eventLogs.schema';
import { User } from '../../schema/user.schema';

@Injectable({})
export class UserLogService extends LogDBService {
  constructor(
    @InjectModel(EventLog.name)
    protected readonly EventLogModel: Model<EventLog>,
  ) {
    super(EventLogModel);
    this.modelName = User.name;
  }

  async doUpdate(params) {
    const self = params.self;
    const { createdBy, createdByUserType, session, enableLog } = self.options;
    console.log('enableLog', enableLog);

    let result = {};
    try {
      const docToUpdate = await self.model.findOne(self.getQuery());
      //compare username
      result = this.compareChangedData(self, docToUpdate, 'username', result);
      //compare salt
      result = this.compareChangedData(self, docToUpdate, 'salt', result);
      //compare status
      result = this.compareChangedData(self, docToUpdate, 'status', result);
      //compare role
      result = this.compareChangedData(self, docToUpdate, 'role', result);
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
