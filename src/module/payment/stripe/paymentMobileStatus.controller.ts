import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('payment-mobile-status')
export class PaymentMobileStatusController {
  constructor() {}

  @Get('success')
  success(@Res() res: Response) {
    res.send('');
  }

  @Get('fail')
  fail(@Res() res: Response) {
    res.send('');
  }

  @Get('cancel')
  cancel(@Res() res: Response) {
    res.send('');
  }
}
