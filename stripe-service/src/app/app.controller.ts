import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { Ctx, MessagePattern, Payload, RedisContext } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @MessagePattern('notifications')
  getNotification(@Payload() data:any, @Ctx() ctx: RedisContext) {
    console.log(`REDIS NOTIF : ${data}`);
    return data;
  }

  @Get()
  getData() {
    return this.appService.getData();
  }
}
