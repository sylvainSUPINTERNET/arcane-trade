/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

export const globalPrefix = 'api';

async function bootstrap() {
  const port = process.env.PORT || 4999;

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(globalPrefix);

  const microserviceRedis = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST,
      port: 6379,
      password: process.env.REDIS_PASSWORD,
      tls: {},
      retryAttempts: 5,
      retryDelay: 3000
    },
  });

  await app.startAllMicroservices();
  await app.listen(port, () => {
    Logger.log( `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  });

}

bootstrap();