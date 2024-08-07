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

        case 'payment_intent.succeeded': // in "manual" payment mode, this means "authorized with success" and we need to confirm the payment manually ( in dashboard for example )
          const { id,shipping, amount, amount_received } = event.data.object;


          this.client.emit("stripe_payment_intent_confirm_request", {
            data: {
              paymentIntentId: id, 
              shipping,
              amount,
              amount_received
            },
            service: STRIPE_SERVICE
          });
          
          Logger.log(`STRIPE_SERVICE send to topic [stripe_payment_intent_confirm_request] ${event.data.object.id} to TELEGRAM_SERVICE`);
          break;

        // default:
        //   Logger.debug(`Unhandled event type ${event.type} ( ignored )`);
      }


      res.status(HttpStatus.OK).json({
        "status": "received webhook event from stripe"
      });

    } catch (err) {

      Logger.error("Stripe event webhook error : " + err.message);

      res.status(HttpStatus.BAD_REQUEST).json({
        "error": `Webhook Error: ${err.message}`
      });

    }
  }

}
