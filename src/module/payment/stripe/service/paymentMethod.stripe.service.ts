import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { StripeAbstract } from '../abstract/stripe.abstract';
import { Model, Types } from 'mongoose';
import { UserRole } from 'src/common/enum';
import { Injectable } from '@nestjs/common';
import { IList, IRetrieve } from '../../interface/crud.interface';
import { PaymentCard } from 'src/module/database/schema/paymentCard.schema';

@Injectable()
export class PaymentMethodStripeService
  extends StripeAbstract
  implements IRetrieve, IList
{
  constructor(
    @InjectModel(PaymentCard.name)
    private readonly paymentCartModel: Model<PaymentCard>,
    protected readonly configService: ConfigService,
  ) {
    super(configService);
  }

  async retrieve(id: string) {
    console.log('params.id');
    try {
      const paymentMethod = await this.stripe.paymentMethods.retrieve(id);
      return paymentMethod;
    } catch (ex) {
      console.log('paymentMethod error', ex.error);
      throw new Error(ex.message);
    }
  }

  async getList() {
    try {
      const paymentMethod = await this.stripe.paymentMethods.list({
        type: 'card',
      });
      console.log('paymentMethod', paymentMethod);
      return paymentMethod;
    } catch (ex) {
      console.log('paymentMethod error', ex.error);
      throw new Error(ex.message);
    }
  }

  async attachToCustomer(id: string, customerId: string) {
    try {
      const attach = await this.stripe.paymentMethods.attach(id, {
        customer: customerId,
      });
      //console.log("attach", attach);
      return attach;
    } catch (ex) {
      console.log('attach error', ex.message);
      throw new Error(ex.message);
    }
  }

  async checkAndAddCard(params: {
    paymentMethodId: string;
    userId: Types.ObjectId | string;
    userType: string;
  }) {
    const pMethod = await this.retrieve(params.paymentMethodId);
    if (!pMethod) {
      return false;
    }

    const data = {
      userId: params.userId,
      userType: params.userType,
      brand: pMethod.card.brand.toLowerCase(),
      funding: pMethod.card.funding.toLowerCase(),
      last4: pMethod.card.last4,
      country: pMethod.card.country.toLowerCase(),
    };

    let paymentCard: any = await this.paymentCartModel.findOne(data);
    if (!paymentCard) {
      paymentCard = await new this.paymentCartModel({
        ...data,
        ...{
          isPrimary: 1,
          infos: pMethod.card,
          brand: pMethod.card.brand.toLowerCase(),
          funding: pMethod.card.funding.toLowerCase(),
          last4: pMethod.card.last4,
          country: pMethod.card.country.toLowerCase(),
          paymentMethodId: params.paymentMethodId,
        },
        createdBy: params.userId,
        createdByUserType: UserRole.PARENT,
      }).save({});
    }
    return pMethod;
  }
}
