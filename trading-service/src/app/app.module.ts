import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonLibModule } from '@arcane-trade/common-lib';

@Module({
  imports: [CommonLibModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
