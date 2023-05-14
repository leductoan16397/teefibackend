import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { MailCollection } from './module/database/schema/mailCollection.schema';
import { Parent } from './module/database/schema/parent.schema';
import { User } from './module/database/schema/user.schema';
import { MAIL_COLLECTION_TYPE } from './common/constant';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Parent.name) private readonly parentModel: Model<Parent>,
    @InjectModel(User.name) private readonly userModel: Model<User>,

    // @InjectModel(MailCollection.name)
    // private readonly mailCollectionModel: Model<MailCollection>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async customerMailGroup({ req, res }: { res: Response; req: Request }) {
    const params = req.query || {};

    const mailCollections = await this.mailCollectionModel.find().lean();

    const clientMailGroup = {
      waitingCustomer: [],
      leadCustomer: [],
      potentialCustomer: [],
      paidCustomer: [],
      payAndLeaveCustomer: [],
    };

    if (mailCollections) {
      const listEmail = [];
      for (const a in mailCollections) {
        listEmail.push(mailCollections[a].email);
      }

      const listUserId = [];

      const users = await this.userModel
        .find({ email: { $in: listEmail } })
        .select('_id')
        .lean();

      for (const u in users) {
        listUserId.push(users[u]._id);
      }

      const tmpStudent = await this.parentModel.find({ userId: { $in: listUserId } }).select(['userId', 'name']);

      const listStudent = {};
      for (const s in tmpStudent) {
        listStudent[tmpStudent[s].userId.toString()] = tmpStudent[s].name;
      }

      for (const i in mailCollections) {
        switch (mailCollections[i].type) {
          case MAIL_COLLECTION_TYPE.waitingCustomer:
            if (clientMailGroup[mailCollections[i].type]) {
              clientMailGroup[mailCollections[i].type].push({
                email: mailCollections[i].email,
                //name: mailCollections[i].name,
                country: mailCollections[i].country == 'vn' ? 'Viet Nam' : mailCollections[i].country,
                createdAt: moment(mailCollections[i].createdAt).format('YYYY-MM-DD HH:mm'),
              });
            }
            continue;
            break;
          case MAIL_COLLECTION_TYPE.leadCustomer:
          case MAIL_COLLECTION_TYPE.potentialCustomer:
          case MAIL_COLLECTION_TYPE.paidCustomer:
          case MAIL_COLLECTION_TYPE.paidAndLeaveCustomer:
            clientMailGroup[mailCollections[i].type].push({
              email: mailCollections[i].email,
              name: listStudent[mailCollections[i].userId.toString()]
                ? listStudent[mailCollections[i].userId.toString()]
                : '',
              country: mailCollections[i].country == 'vn' ? 'Viet Nam' : mailCollections[i].country,
              createdAt: moment(mailCollections[i].createdAt).format('YYYY-MM-DD HH:mm'),
            });
            break;
        }
      }
    }
    const body = JSON.stringify(clientMailGroup[params.type as string] || []);
    res.send(body);
  }
}
