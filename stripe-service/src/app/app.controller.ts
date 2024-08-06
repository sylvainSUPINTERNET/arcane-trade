import { Controller, Get, HttpStatus, Inject, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { AppService } from './app.service';
import { ClientProxy, Ctx, MessagePattern, Payload, RedisContext } from '@nestjs/microservices';
import { STRIPE_SERVICE } from './constants';
import Stripe from 'stripe';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              @Inject('REDIS_CLIENT') private readonly client: ClientProxy,
              
  ) {}

  // @Post webhook here : https://dashboard.stripe.com/test/webhooks/create?endpoint_location=local

  @Post('webhook') // /api/webhook
  webhookStripe(@Req() req: Request, @Res() res: Response) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const sig = req.headers['stripe-signature'];
    const rawBody = req['rawBody']; // Access the rawBody from the request

    console.log(sig);

    try {
      // TODO

      const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      console.log("Stripe event webhook : " + event);
      res.status(HttpStatus.OK).json({
        "status": "received webhook event from stripe"
      });

    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json({
        "error": `Webhook Error: ${err.message}`
      });
    }
  }


  @Get("emit") // /api/emit
  emit() {
    this.client.emit("webhook_payment_stripe_succeed", {
      data: "PAYMENT SUCCEED !",
      service: STRIPE_SERVICE
    });
    console.log("STRIPE_SERVICE : emitted notification to STUART_SERVICE");
    return "emitted";
  }

  @Get()
  getData() {
    return this.appService.getData();
  }
}
