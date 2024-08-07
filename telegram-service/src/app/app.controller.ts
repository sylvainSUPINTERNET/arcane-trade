import { Controller, Get, HttpStatus, Logger, Post, Req, Res} from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Post("webhook")
  webhook(@Req() req, @Res() res) {
    console.log("webhook : ", req.headers);
    console.log("webhook : ", req.body);

    if ( req.headers["x-telegram-bot-api-secret-token"] === undefined || req.headers["x-telegram-bot-api-secret-token"] !== process.env.TELEGRAM_SECRET_TOKEN_WEBHOOK ) { 
      Logger.error("Wrong secret token webhook request is ignored. ");
      res.status(HttpStatus.FORBIDDEN).send();
    } else {
      res.status(HttpStatus.OK).send();
    }
  }

  @Get()
  getData() {
    return this.appService.getData();
  }
}
