import { Controller, Get, HttpStatus, Logger, Post, Req, Res} from '@nestjs/common';
import axios from "axios";
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Post("webhook")
  async webhook(@Req() req, @Res() res) {
    const telegramBotToken =  process.env.TELEGRAM_BOT_ACCESS_TOKEN as string;

    if ( req.headers["x-telegram-bot-api-secret-token"] === undefined || req.headers["x-telegram-bot-api-secret-token"] !== process.env.TELEGRAM_SECRET_TOKEN_WEBHOOK ) { 
      Logger.error("Wrong secret token webhook request is ignored. ");
      res.status(HttpStatus.FORBIDDEN).send();
    } else {


      // Clicked on "yes" in prompt
      if ( req.body.callback_query ) {
        console.log("callback_query : ", req.body.callback_query);
      }

      res.status(HttpStatus.OK).send();
    }
  }

  @Get()
  getData() {
    return this.appService.getData();
  }
}
