import * as moment from 'moment';
import { StripeAbstract } from '../abstract/stripe.abstract';
import { Injectable } from '@nestjs/common';
import { IRetrieve } from '../../interface/crud.interface';

@Injectable()
export class InvoiceStripeService extends StripeAbstract implements IRetrieve {
  async getListPaidBySubscription(subscriptionId: string) {
    try {
      const invoices = await this.stripe.invoices.list({
        status: 'paid',
        subscription: subscriptionId,
        // paid: true,
      });

      const listInvoiceId = [];
      const listInvoice = [];
      let totalAmount = 0;

      if (invoices) {
        for (const i in invoices.data) {
          //console.log("invoices.data[i].lines.data[0]", moment.unix(invoices.data[i].lines.data[0].period.start).format('YYYY-MM-DD HH:mm:00'));
          listInvoiceId.push(invoices.data[i].lines.data[0].id);
          totalAmount += invoices.data[i].lines.data[0].amount;
          listInvoice.push({
            invoiceId: invoices.data[i].lines.data[0].id,
            amount: invoices.data[i].lines.data[0].amount,
            priceId: invoices.data[i].lines.data[0].price.id,
            productId: invoices.data[i].lines.data[0].price.product,
            period: {
              //start: invoices.data[i].lines.data[0].period.start,
              //end: invoices.data[i].lines.data[0].period.end
              start: moment.unix(invoices.data[i].lines.data[0].period.start).format('YYYY-MM-DD HH:mm:00'),
              end: moment.unix(invoices.data[i].lines.data[0].period.end).format('YYYY-MM-DD HH:mm:00'),
            },
          });
        }
      }

      return {
        invoiceIds: listInvoiceId,
        invoiceInfos: listInvoice,
        totalAmount: totalAmount,
      };
    } catch (ex) {
      throw new Error(ex.message);
    }
  }

  async getListBySubscription(subscriptionId: string) {
    try {
      const invoices = await this.stripe.invoices.list({
        subscription: subscriptionId,
      });

      return invoices;
    } catch (ex) {
      throw new Error(ex.message);
    }
  }

  async getRecentInvoice(subscriptionId: string) {
    try {
      const invoice = await this.stripe.invoices.list({
        subscription: subscriptionId,
        status: 'paid',
        limit: 1,
        expand: ['data.charge'],
      });

      return invoice;
    } catch (ex) {
      throw new Error(ex.message);
    }
  }

  async retrieve(id: string) {
    try {
      const invoice = await this.stripe.invoices.retrieve(id);

      return invoice;
    } catch (ex) {
      throw new Error(ex.message);
    }
  }
}
