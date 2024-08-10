import { Controller, Get, HttpStatus, Inject, Logger, Post, Req, Res} from '@nestjs/common';
import axios from "axios";
import { AppService } from './app.service';
import { ClientProxy, Ctx, MessagePattern, Payload, RedisContext } from '@nestjs/microservices';
import { CommonLibService } from '@arcane-trade/common-lib';


export interface IPaymentIntentConfirmRequestPayload {
  data: {
    paymentIntentId: string,
    shipping: { 
      address: {
        city: string,
        country: string,
        line1: string,
        line2?: string,
        postal_code: string,
        state: string
      },
      carrier?: string,
      name: string,
      phone?: string,
      tracking_number?: string
    },
    amount: number,
    amount_received: number
  }
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService, 
    private readonly dbService: CommonLibService,
    @Inject('REDIS_CLIENT') private readonly client: ClientProxy) {}

  // We get event on stripe webhook, payment is "manual" so we need to confirm once the payment is successful
  @MessagePattern('stripe_payment_intent_confirm_request')
  async sendPaymentIntentConfirmationRequest( @Payload() msg:IPaymentIntentConfirmRequestPayload, @Ctx() ctx: RedisContext ) {
    Logger.log(`TELEGRAM_SERVICE : received stripe_payment_intent_confirm_request`, msg.data.paymentIntentId);
    // Once confirmed ( or not ), we hadle the payment intent in the telegram webhook
    await this.appService.sendMessagePaymentIntentConfirm(msg);
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
        const paymentId = req.body.callback_query.data.split("@")[1];

        console.log("response : ", paymentId);

        if (  response === "yes" ) {
          Logger.log(`callback_query : YES -> Payment intent confirmed ${paymentId}`);
          // TODO : confirm payment intent ( must send to "manual" the payment mode in Stripe )
          // TODO : create stuart job
          // TODO : bot send confirm msg to chat
          // ADD : to redis or somewhere, so when we clik on yes and after "no" it does nothing !


          if ( await this.dbService.getDecisionHistory(paymentId) === null ) {
            await this.appService.sendMessagePaymentIntentResponse("Confirmed", paymentId);
            await this.dbService.saveDicisionHistory("Confirmed", paymentId);

            this.client.emit('stuart_create_job', { paymentIntentId: paymentId });
          }
          

        } else if ( response === "no" ) {
          Logger.log(`callback_query : NO -> Payment intent cancel ${paymentId}`);
          // TODO : cancel payment
          // TODO : notify user payment intent has been cancel

          if ( await this.dbService.getDecisionHistory(paymentId) === null ) {
            await this.appService.sendMessagePaymentIntentResponse("Cancel", paymentId);
            await this.dbService.saveDicisionHistory("Cancel", paymentId);
          }

        } else {
          Logger.error("Unknown callback query data : ", req.body.callback_query);
        }


      }

      res.status(HttpStatus.OK).send();
    }
  }

}
