import { Controller, Get, HttpStatus, Inject, Logger, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { AppService } from './app.service';
import { ClientProxy, Ctx, MessagePattern, Payload, RedisContext } from '@nestjs/microservices';
import { STRIPE_SERVICE } from './constants';
import Stripe from 'stripe';
import { CommonLibService } from '@arcane-trade/common-lib';
import ShortUniqueId from 'short-unique-id';


const stripe = new Stripe(process.env.STRIPE_KEY_SECRET);



@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              @Inject('REDIS_CLIENT') private readonly client: ClientProxy,
              private readonly dbService: CommonLibService
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


        case 'checkout.session.completed':

          const {id, customer_details, payment_intent} = event.data.object;

          const paymentIntentData:Stripe.PaymentIntent  = await stripe.paymentIntents.retrieve(payment_intent as string);

          let telegramFitIdMapSessionId = new ShortUniqueId({ length: 10 }).rnd(); // nanoid is not working ( ESM issue for some reason )

          await this.dbService.saveTelegramFitIdMapSessionId(telegramFitIdMapSessionId, id);
          this.client.emit("stripe_checkout_session_completed", {
            data: {
              sessionId: id,
              customerDetails: customer_details,
              paymentIntentId: payment_intent,
              shippingDetails: paymentIntentData.shipping,
              amount: paymentIntentData.amount,
              amount_received:  paymentIntentData.amount_received,
              telegramFitIdMapSessionId
            },
            service: STRIPE_SERVICE
          });
          Logger.log(`STRIPE_SERVICE send to topic [stripe_checkout_session_completed] ${event.data.object.id} to TELEGRAM_SERVICE`);
          break;


        // case 'payment_intent.succeeded': // in "manual" payment mode, this means "authorized with success" and we need to confirm the payment manually ( in dashboard for example )
        //   const { id,shipping, amount, amount_received } = event.data.object;
        //   console.log("FUCK3 ?" , event.data.object);
        //   console.log("????",event.data.object.metadata.session_id);
        //   this.client.emit("stripe_payment_intent_confirm_request", {
        //     data: {
        //       paymentIntentId: id, 
        //       shipping,
        //       amount,
        //       amount_received
        //     },
        //     service: STRIPE_SERVICE
        //   });
          
        //   Logger.log(`STRIPE_SERVICE send to topic [stripe_payment_intent_confirm_request] ${event.data.object.id} to TELEGRAM_SERVICE`);
        //   break;

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
