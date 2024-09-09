import { Controller, Get, HttpCode, HttpStatus, Inject, Logger, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { ClientProxy, Ctx, MessagePattern, Payload, RedisContext } from '@nestjs/microservices';
import { v7 as uuidv7 } from 'uuid';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_KEY_SECRET);

import {
  Authenticator,
  Environment,
  ApiResponse,
  HttpClient
} from 'stuart-client-js'
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';



@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('REDIS_CLIENT') private readonly client: ClientProxy,
    // @InjectQueue('order') private orderQueue: Queue
  ) {}

  @Get("/health")
  @HttpCode(200)
  async getHealth() {
    return "OK";
  }


  @MessagePattern('stuart_create_job')
  async createJob( @Payload() msg:{sessionId:string}, @Ctx() ctx: RedisContext ) {
    Logger.log(`STUART_SERVICE : received create job from TELEGRAM_SERVICE`, msg.sessionId);

    const sessionData:Stripe.Checkout.Session = await stripe.checkout.sessions.retrieve(msg.sessionId);
    console.log("session infos : ", sessionData);
    const paymentData:Stripe.PaymentIntent  = await stripe.paymentIntents.retrieve(sessionData.payment_intent as string);
    console.log("paymentIntent infos : ", paymentData.shipping);

    await this.appService.createNewJob(paymentData, sessionData);

  }

  @Post("webhook")
  stuartWebhook( @Req() req: Request, @Res() res: Response ) {
    console.log("hook", req.body);
    res.status(HttpStatus.OK).json({
      "status": "received webhook event from stuart"
    });
  }


  // @Get("/test")
  // @HttpCode(200)
  // async test() {
  //   const job = await this.orderQueue.add('createJob', {
  //     id: uuidv7()
  //   },
  //   {
  //     delay: 3000 // 3 seconds
  //   });

  //   console.log(job);

  //   return "OK";
  // }

  // TODO : uncomment this code but you should NOT listen for this event, but event from telegram on "YES" prompt
  // @MessagePattern('webhook_payment_stripe_succeed')
  // getNotification( @Payload() msg:payloadWebhookPaymentStripeSucceed, @Ctx() ctx: RedisContext ) {
  //   Logger.log(`STUART_SERVICE : received shipping`, msg.data.shipping);

  //   let environment;
  //   if ( process.env.STUART_ENV === 'production' ) {
  //     environment = Environment.PRODUCTION();
  //   } else {
  //     environment = Environment.SANDBOX();
  //   }
  //   const api_client_id = `${process.env.STUART_ID_CLIENT}` // can be found here: https://admin-sandbox.stuart.com/client/api
  //   const api_client_secret = `${process.env.STUART_SECRET}` // can be found here: https://admin-sandbox.stuart.com/client/api
  //   const auth = new Authenticator(environment, api_client_id, api_client_secret)

  //   const httpClient = new HttpClient(auth)
    
  //   const job = {
  //     job: {
  //       transport_type: "bike",
  //       pickups: [
  //         {
  //           address: "46 Boulevard Barbès, 75018 Paris",
  //           comment: "Wait outside for an employee to come.",
  //           contact: {
  //             firstname: "Martin",
  //             lastname: "Pont",
  //             phone: "+33698348756'",
  //             company: "KFC Paris Barbès"
  //           }
  //         }
  //       ],
  //       dropoffs: [
  //         {
  //           address: "156 rue de Charonne, 75011 Paris",
  //           package_description: "Red packet.",
  //           client_reference: uuidv7(), // must be unique
  //           comment: "code: 3492B. 3e étage droite. Sonner à Durand.",
  //           contact: {
  //             firstname: "Alex",
  //             lastname: "Durand",
  //             phone: "+33634981209",
  //             company: "Durand associates."
  //           }
  //         }
  //       ]
  //     }
  //   }
    
  //   httpClient.performPost('/v2/jobs', JSON.stringify(job))
  //     .then((apiResponse) => { console.log(apiResponse) })
  //     .catch((error) => { console.log(error) })
      
  //   httpClient.performGet('/v2/jobs')
  //   .then((apiResponse) => { console.log(apiResponse) })
  //   .catch((error) => { console.log(error) })


  //   return msg.data;
  // }


  
}
