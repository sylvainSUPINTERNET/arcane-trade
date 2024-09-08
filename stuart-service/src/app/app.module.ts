import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { CommonLibModule } from '@arcane-trade/common-lib';
import { BullModule } from '@nestjs/bullmq';
import { OrderConsumer } from './consumer/order.consumer';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([ // used as proxy, could be replaced by another transporter without changing the code
      {
        name: 'REDIS_CLIENT',
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT as unknown as number,
          password: process.env.REDIS_PASSWORD,
          tls: {},
        },
      }
    ]),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT as unknown as number,
        password: process.env.REDIS_PASSWORD,
        tls: {}
      },
    }),
    BullModule.registerQueue({
      name: 'order',
    })
  ],
  controllers: [AppController],
  providers: [AppService, OrderConsumer],
})
export class AppModule {}
