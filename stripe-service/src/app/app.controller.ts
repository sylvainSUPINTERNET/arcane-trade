import { Controller, Get, HttpStatus, Inject, Logger, Post, Req, Res } from '@nestjs/common';
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
  async webhookStripe(@Req() req: Request, @Res() res: Response) {
    const stripe = new Stripe(process.env.STRIPE_KEY_SECRET as string)
    const sig = req.headers['stripe-signature'];
    const rawBody = req["rawBody"]; // middleware

    try {

      const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WHSC as string);

      switch (event.type) {

        case 'payment_intent.succeeded':

          const { id, shipping } = event.data.object;


          this.client.emit("webhook_payment_stripe_succeed", {
            data: {
              paymentIntentId: id, 
              shipping
            },
            service: STRIPE_SERVICE
          });
          
          Logger.log(`STRIPE_SERVICE send payment_intent ${event.data.object.id} to STUART_SERVICE`);

          break;

        default:
          Logger.log(`Unhandled event type ${event.type} ( ignored )`);
      }


      res.status(HttpStatus.OK).json({
        "status": "received webhook event from stripe"
      });

    } catch (err) {

      console.log("Stripe event webhook error : " + err.message);
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
