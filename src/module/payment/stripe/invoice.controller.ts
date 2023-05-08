import { Controller, Get, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeGateway } from './stripe.gateway';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly stripeGateway: StripeGateway) {}

  @Get('dynamic-data')
  // @Render('invoice-sample.ejs')
  dynamicData(@Req() req: Request, @Res() res: Response) {
    const {
      user,
      invoiceNumber,
      companyName,
      companyAddress,
      companyPhone,
      companyDomain,
      customerName,
      customerEmail,
      invoiceInfo,
      amount,
      productName,
      productDuration,
      productTitle,
      date,
      dateOfIssue,
      total,
      paidAmount,
      amountDue,
      customerAddress,
    } = req.query;

    const options = { format: 'A4' };

    return res.render('invoice-sample', {
      invoiceNumber,
      companyName,
      companyAddress,
      companyPhone,
      companyDomain,
      customerName,
      customerEmail,
      invoiceInfo,
      amount,
      productName,
      productDuration,
      productTitle,
      date,
      dateOfIssue,
      total,
      paidAmount,
      amountDue,
      customerAddress,
    });
  }

  @Get('pdf')
  async pdf(@Req() req: Request, @Res() res: Response) {
    try {
      const id: string = req.query.id as string;
      console.log('id', id);

      if (!id) {
        throw new Error('No invoice found (1)');
      }

      const result = await this.stripeGateway.generateInvoice({
        invoiceAliasId: id,
      });

      res.send(result);
    } catch (ex) {
      console.log('ex', ex.message);
      res.send({
        success: false,
        msg: ex.message,
      });
    }
  }
}
