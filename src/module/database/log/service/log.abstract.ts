import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { EventLog } from '../../schema/eventLogs.schema';

interface LogParam {
  action: string;
  createdBy: Types.ObjectId;
  createdByUserType: string;
  compareResult?: any;
  docToUpdate?: any;
  docToCreate?: any;
  docToRemove?: any;
}

export abstract class LogDBService {
  protected modelName: string;

  constructor(
    @InjectModel(EventLog.name)
    protected readonly EventLogModel: Model<EventLog>,
  ) {}

  abstract doCreate(data: any): void;
  abstract doUpdate(data: any): void;
  abstract doRemove(data: any): void;

  compareChangedData(self, docToUpdate, fieldName, result) {
    let tmpOriginal = false;
    if (self._update[fieldName]) {
      tmpOriginal = docToUpdate[fieldName];
      docToUpdate[fieldName] = self._update[fieldName];
      if (docToUpdate.isModified(fieldName)) {
        result[fieldName] = {
          original: tmpOriginal,
          changes: self._update[fieldName],
        };
      }
    }
    return result;
  }

  async logForUpdate({
    params,
    session,
  }: {
    params: LogParam;
    session?: ClientSession | null;
  }) {
    if (Object.keys(params.compareResult).length) {
      const subAction = [];
      for (const i in params.compareResult) {
        subAction.push(i);
      }
      const logData: EventLog = {
        modelName: this.modelName,
        action: params.action,
        subAction: subAction.join(','),
        dataId: params.docToUpdate._id,
        dataChanged: params.compareResult,
        createdBy: params.createdBy,
        createdByUserType: params.createdByUserType,
      };
      await new this.EventLogModel(logData).save({ session });
    }
  }

  async logForCreate({
    params,
    session,
  }: {
    params: LogParam;
    session?: ClientSession | null;
  }) {
    const logData: EventLog = {
      modelName: this.modelName,
      action: params.action,
      dataId: params.docToCreate._id,
      dataChanged: params.docToCreate,
      createdBy: params.createdBy,
      createdByUserType: params.createdByUserType,
    };
    await new this.EventLogModel(logData).save({ session });
  }

  async logForRemove({
    params,
    session,
  }: {
    params: LogParam;
    session?: ClientSession | null;
  }) {
    const logData: EventLog = {
      modelName: this.modelName,
      action: params.action,
      dataId: params.docToRemove._id,
      dataChanged: params.docToRemove,
      createdBy: params.createdBy,
      createdByUserType: params.createdByUserType,
    };
    await new this.EventLogModel(logData).save({ session });
  }
}
