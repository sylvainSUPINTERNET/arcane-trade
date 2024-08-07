/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

import axios from "axios";
import https from 'https'



  // Init webhook
const bootstrapBotTelegram = async () => {

  const telegramBotToken = process.env.TELEGRAM_BOT_ACCESS_TOKEN as string;

  try {
    // const response = await axios.get(`https://api.telegram.org/bot${telegramBotToken}/getUpdates`);
    // console.log(response.data.result[0].message.chat.id);
    
    const resp = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/setWebhook?secret_token=${process.env.TELEGRAM_SECRET_TOKEN_WEBHOOK as string}`, {
      url: `${process.env.TELEGRAM_FORWARD_URL_WEBHOOK as string}`
    });

    Logger.log("Telegram webhook : ", resp.data, "TELEGRAM_FORWARD_URL_WEBHOOK : ", process.env.TELEGRAM_FORWARD_URL_WEBHOOK);

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
