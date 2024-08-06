/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const port = process.env.PORT || 5999;
  const globalPrefix = 'api';

  const app = await NestFactory.create(AppModule, {
    cors: true
  });
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
    Logger.log( `🚀 [ STUART-SERVICE ] - Application is running on: http://localhost:${port}/${globalPrefix}`);
  });

}

bootstrap();