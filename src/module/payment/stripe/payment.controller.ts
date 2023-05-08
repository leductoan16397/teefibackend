import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { HOOK_EVENT } from 'src/common/constant';
import { InvoicePaidService } from './service/invoicePaid.service';

@Controller('payment-callback')
export class PaymentController {
  constructor(private readonly invoicePaidService: InvoicePaidService) {}

  @Post('stripe')
  async stripe(@Req() req: Request, @Res() res: Response) {
    try {
      const type = req.body.type;
      //console.log("callback stripe type >>>>>", type);

      switch (type) {
        // case stripeConstants.hookEvents.customerSubscriptionCreated:
        //     evt = new customerSubscriptionCreated(req.body.data.object);
        // break;
        // case stripeConstants.hookEvents.chargeSucceeded:
        //     evt = new customerChargeSucceeded(req.body.data.object);
        // break;
        case HOOK_EVENT.invoicePaid:
          this.invoicePaidService.process({
            ...req.body.data.object,
          });
          break;
      }
    } catch (ex) {
      console.log('ex', ex.message);
    }

    res.sendStatus(200);
  }
}
