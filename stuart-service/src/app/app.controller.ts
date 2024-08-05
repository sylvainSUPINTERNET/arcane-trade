import { Controller, Get, Inject } from '@nestjs/common';

import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, @Inject('REDIS_CLIENT') private readonly client: ClientProxy) {}

  @Get()
  getData() {
    return "hello";
  }

  @Get("emit")
  emit() {
    this.client.emit("hello", "world");
    return "emitted";
  }

  
}
