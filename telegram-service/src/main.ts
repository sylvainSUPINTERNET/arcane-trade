/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

import axios from "axios";

import https from 'https'



  // Init webhook & get chatId
const bootstrapBotTelegram = async () => {

  const httpsAgent  = new https.Agent({
    rejectUnauthorized: process.env.AXIOS_REJECT_UNAUTHORIZED as unknown as boolean  || true// (NOTE: this will disable client verification) => use it in dev only
  });

  const telegramBotToken = process.env.TELEGRAM_BOT_ACCESS_TOKEN as string;

  try {

    const response = await axios.get(`https://api.telegram.org/bot${telegramBotToken}/getUpdates`, {httpsAgent});

    console.log("TELEGRAM : ", response);

    response.data.result.forEach( update => {
      const chatId = update.message.chat.id;
      console.log("chatId detected : ", chatId);
    })


  } catch ( e ) {
    console.log("Error while bootstrap bot telegram : ", e);
  }
  
}


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 6999;
  await app.listen(port);

  await bootstrapBotTelegram();



  Logger.log(
    `🚀 [TELEGRAM-SERVICE] Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
