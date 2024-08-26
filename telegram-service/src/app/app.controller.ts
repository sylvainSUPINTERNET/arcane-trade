import { Controller, Get, HttpStatus, Inject, Logger, Post, Req, Res} from '@nestjs/common';
import axios from "axios";
import { AppService } from './app.service';
import { ClientProxy, Ctx, MessagePattern, Payload, RedisContext } from '@nestjs/microservices';
import { CommonLibService } from '@arcane-trade/common-lib';


/*

{
  "sessionId": "cs_test_a1366zNE2hFoVROn9QHCh3hyOJ8FfT2T1KHJYTY4riNq0OM1UKFnyHuS6l",
  "customerDetails": {
    "address": {
      "city": "South San Francisco",
      "country": "US",
      "line1": "354 Oyster Point Blvd",
      "line2": null,
      "postal_code": "94080",
      "state": "CA"
    },
    "email": "stripe@example.com",
    "name": "Jenny Rosen",
    "phone": null,
    "tax_exempt": "none",
    "tax_ids": []
  },
  "paymentIntent": "pi_3Ps9taHuZqrzwWhv1nGPx5Io",
  "shippingDetails": {
    "address": {
      "city": "San Francisco",
      "country": "US",
      "line1": "510 Townsend St",
      "line2": null,
      "postal_code": "94103",
      "state": "CA"
    },
    "carrier": null,
    "name": "Jenny Rosen",
    "phone": null,
    "tracking_number": null
  },
  "amount": 3000
}

*/

export interface IPaymentIntentConfirmRequestPayload {
  data: {
    "telegramFitIdMapSessionId": string, // use it for prompt telegram ( else it'stoo long )
    "sessionId": string,//"cs_test_a1jpqF9LZW6dl9REXkrDoybyDKB4ghaHS4z76q7lH0N3DrUTlVx6JJlhfw",
    "customerDetails": {
      "address": {
        "city": string //"South San Francisco",
        "country": string, // "US",
        "line1": string, //"354 Oyster Point Blvd",
        "line2": string | null,
        "postal_code": string, // "94080",
        "state": string, // "CA"
      },
      "email": string, // "stripe@example.com",
      "name": string, // "Jenny Rosen",
      "phone": string | null, // "+33644331122",
      "tax_exempt": string, // "none",
      "tax_ids": any[] // []
    },
    "paymentIntentId": string, //"pi_3Ps9v0HuZqrzwWhv156IhP7S",
    "shippingDetails": {
      "address": {
        "city": string, //"San Francisco",
        "country": string, //"US",
        "line1": string, //"510 Townsend St",
        "line2":string | null, // null,
        "postal_code": string, //"94103",
        "state": string //"CA"
      },
      "carrier": any | null // null,
      "name":  string, //"Jenny Rosen",
      "phone": string | null, // "if you send event from stripe CLI, yes its null else no"
      "tracking_number": null
    },
    "amount": number, //3000,
    "amount_received": number //3000
  }
}


@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService, 
    private readonly dbService: CommonLibService,
    @Inject('REDIS_CLIENT') private readonly client: ClientProxy) {}

  // We get event on stripe webhook, payment is "manual" so we need to confirm once the payment is successful
  @MessagePattern('stripe_checkout_session_completed')
  async sendPaymentIntentConfirmationRequest( @Payload() msg:IPaymentIntentConfirmRequestPayload, @Ctx() ctx: RedisContext ) {
    Logger.log(`TELEGRAM_SERVICE : received stripe_checkout_session_completed`, msg.data);
    // Once confirmed ( or not ), we hadle the payment intent in the telegram webhook
    await this.appService.sendMessagePaymentIntentConfirm(msg);
  }

  @MessagePattern('stuart_job_tracking_link')
  async sendJobTrackingLink( @Payload() msg:{tracking_url:string, paymentIntentId: string, sessionId: string}, @Ctx() ctx: RedisContext ) {
    Logger.log(`TELEGRAM_SERVICE : received stuart_job_tracking_link`, msg.tracking_url);
    // Send the tracking link to the user
    await this.appService.sendMessageJobTrackingLink(msg);
  }

  @Post("webhook")
  async webhook(@Req() req, @Res() res) {

    if ( req.headers["x-telegram-bot-api-secret-token"] === undefined || req.headers["x-telegram-bot-api-secret-token"] !== process.env.TELEGRAM_SECRET_TOKEN_WEBHOOK ) { 
      Logger.error("Wrong secret token webhook request is ignored. ");
      res.status(HttpStatus.FORBIDDEN).send();
    } else {
      
      // Clicked on "yes" || "no" in prompt
      if ( req.body.callback_query ) {
        const response = req.body.callback_query.data.split("@")[0];
        const telegramFitIdMapSessionId = req.body.callback_query.data.split("@")[1]; //shortId

        let {sessionId} = await this.dbService.getSessionIdFromTelegramFitIdMapSessionId(telegramFitIdMapSessionId);

        if (  response === "yes" ) {
          Logger.log(`callback_query : YES -> SessionId confirmed ${sessionId}`);
          // TODO : confirm payment intent ( must send to "manual" the payment mode in Stripe )
          // TODO : create stuart job
          // TODO : bot send confirm msg to chat
          // ADD : to redis or somewhere, so when we clik on yes and after "no" it does nothing !


          if ( await this.dbService.getDecisionHistory(sessionId) === null ) {
            await this.appService.sendMessagePaymentIntentResponse("Confirmed", sessionId);
            await this.dbService.saveDicisionHistory("Confirmed", sessionId);

            this.client.emit('stuart_create_job', { sessionId });
          }
          

        } else if ( response === "no" ) {
          Logger.log(`callback_query : NO -> SessionId cancel ${sessionId}`);
          // TODO : cancel payment
          // TODO : notify user payment intent has been cancel

          if ( await this.dbService.getDecisionHistory(sessionId) === null ) {
            await this.appService.sendMessagePaymentIntentResponse("Cancel", sessionId);
            await this.dbService.saveDicisionHistory("Cancel", sessionId);
          }

        } else {
          Logger.error("Unknown callback query data : ", req.body.callback_query);
        }


      }

      res.status(HttpStatus.OK).send();
    }
  }

}
