import { Controller, Get, Inject } from '@nestjs/common';

import { AppService } from './app.service';
import { ClientProxy, Ctx, MessagePattern, Payload, RedisContext } from '@nestjs/microservices';

interface payloadWebhookPaymentStripeSucceed {
  data: string
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, @Inject('REDIS_CLIENT') private readonly client: ClientProxy) {}

  @Get()
  getData() {
    return "hello";
  }


  
  @MessagePattern('webhook_payment_stripe_succeed')
  getNotification(@Payload() msg:payloadWebhookPaymentStripeSucceed, @Ctx() ctx: RedisContext) {
    console.log(ctx);
    console.log(`STRIPE SERVICE : received notification from : ${msg.data}`);
    return msg.data;
  }


  
}
