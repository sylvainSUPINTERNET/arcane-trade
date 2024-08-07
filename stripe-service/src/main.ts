/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import bodyParser from 'body-parser';
import { Request, Response } from 'express';

export const globalPrefix = 'api';

async function bootstrap() {
  const port = process.env.PORT || 4999;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true
  });
  app.setGlobalPrefix(globalPrefix);

  app.use(bodyParser.json({
    verify: function (req:Request, res:Response, buf) {
      var url = req.originalUrl;
      if (url.startsWith('/api/webhook')) {
        req["rawBody"] = buf.toString();
      }
    }
  }));

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
  await app.listen(port, () => {
    Logger.log( `🚀  [ STRIPE-SERVICE ] - Application is running on: http://localhost:${port}/${globalPrefix}`);
  });

}

bootstrap();