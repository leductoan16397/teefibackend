import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  getHello() {
    return this.appService.getHello();
  }

  @Get('home')
  async home(@Res() res: Response) {
    return res.send('teefi.io');
  }

  @Get('metabase/customerMailGroup')
  async customerMailGroup(@Res() res: Response, @Req() req: Request) {
    return this.appService.customerMailGroup({ res, req });
  }
}
