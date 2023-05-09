import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { RestCurrentUser } from './module/auth/decorator/loggedUser.decorator';
import { LoggedUser } from './module/auth/passport/auth.type';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  getHello(@RestCurrentUser() user: LoggedUser) {
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
