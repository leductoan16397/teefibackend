import { LogDBService } from './log.abstract';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LOG_ACTION } from 'src/common/constant';
import { Injectable } from '@nestjs/common';
import { EventLog } from '../../schema/eventLogs.schema';

@Injectable({})
export class EnrollHistoryLogService extends LogDBService {
  constructor(
    @InjectModel(EventLog.name)
    protected readonly EventLogModel: Model<EventLog>,
  ) {
    super(EventLogModel);
    // this.modelName = EnrollHistory.name;
  }

  async doUpdate({ self }: { self }) {
    const { createdBy, createdByUserType, session, enableLog } = self.options;
    console.log('enableLog', enableLog);

    let result = {};
    try {
      const docToUpdate = await self.model.findOne(self.getQuery());
      //compare name
      result = this.compareChangedData(self, docToUpdate, 'expireTime', result);
      //compare gender
      result = this.compareChangedData(self, docToUpdate, 'invoiceId', result);
      //compare status
      result = this.compareChangedData(self, docToUpdate, 'status', result);

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

      //console.log("result", result);
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

      //console.log("result", result);
    } catch (err) {
      console.error('err >>>>', err);
    }
  }

  async doRemove({ self }: { self }) {
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

      //console.log("result", result);
    } catch (err) {
      console.error('err >>>>', err);
    }
  }
}
