/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

import axios from "axios";

import { MicroserviceOptions, Transport } from '@nestjs/microservices';


  // Init webhook
const bootstrapBotTelegram = async () => {

  const telegramBotToken = process.env.TELEGRAM_BOT_ACCESS_TOKEN as string;

  try {

    // const r = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/deleteWebhook`);
    // Logger.log("Delete webhook : ", r.data);
    
    const resp = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/setWebhook?secret_token=${process.env.TELEGRAM_SECRET_TOKEN_WEBHOOK as string}`, {
      url: `${process.env.TELEGRAM_FORWARD_URL_WEBHOOK as string}`
    });

    Logger.log("Telegram webhook : ", resp.data, "TELEGRAM_FORWARD_URL_WEBHOOK : ", process.env.TELEGRAM_FORWARD_URL_WEBHOOK);

  } catch ( e ) {
    Logger.log("Error while bootstrap bot telegram : ", e);
  }
  
}



async function bootstrap() {
  const port = process.env.PORT || 6999;
  const globalPrefix = 'api';

  await bootstrapBotTelegram();

  const app = await NestFactory.create(AppModule, {
    cors: true
  });
  app.setGlobalPrefix(globalPrefix);

  const microserviceRedis = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT as unknown as number,
      password: process.env.REDIS_PASSWORD,
      tls: {},
      retryAttempts: 5,
      retryDelay: 3000
    },
  });

  await app.startAllMicroservices();

  await app.listen(port, "0.0.0.0", () => {
    Logger.log(
      `🚀 [TELEGRAM-SERVICE] Application is running on: http://localhost:${port}/${globalPrefix}`
    );
  });

}

bootstrap();