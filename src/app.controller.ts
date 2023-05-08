import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { RestCurrentUser } from './module/auth/decorator/loggedUser.decorator';
import { LoggedUser } from './module/auth/passport/auth.type';
import { AuthRest } from './module/auth/decorator/auth.decorator';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @AuthRest()
  @Post()
  getHello(@RestCurrentUser() user: LoggedUser): string {
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
