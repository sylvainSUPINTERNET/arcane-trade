import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CommonLibModule } from '@arcane-trade/common-lib';

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
      },
    ]),
    CommonLibModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
