import { Controller, HttpStatus, Inject, Logger, Post, Req, Res } from '@nestjs/common';
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



@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('REDIS_CLIENT') private readonly client: ClientProxy
  ) {}

  @MessagePattern('stuart_create_job')
  async createJob( @Payload() msg:{sessionId:string}, @Ctx() ctx: RedisContext ) {
    Logger.log(`STUART_SERVICE : received create job from TELEGRAM_SERVICE`, msg.sessionId);

    const sessionData:Stripe.Checkout.Session = await stripe.checkout.sessions.retrieve(msg.sessionId);
    console.log("session infos : ", sessionData);
    const paymentData:Stripe.PaymentIntent  = await stripe.paymentIntents.retrieve(sessionData.payment_intent as string);
    console.log("paymentIntent infos : ", paymentData.shipping);


    // send SMS
    const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
    const authToken = process.env.TWILIO_AUTH_TOKEN as string;
    const client = require('twilio')(accountSid, authToken);
    client.messages
        .create({
            body: 'Hello mf',
            messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE as string,
            to: `${sessionData.customer_details.phone}`
        })
        .then(message => console.log(message.sid));

    await this.appService.createNewJob(paymentData, sessionData);


    /*

    session infos :  {
  id: 'cs_test_a1H2j3mLclXJL45Bn2EaRqQggMiaykemXEzyundNy5p0wE3cOcqGzRc7bq',
  object: 'checkout.session',
  after_expiration: null,
  allow_promotion_codes: null,
  amount_subtotal: 3000,
  amount_total: 3000,
  automatic_tax: { enabled: false, liability: null, status: null },
  billing_address_collection: null,
  cancel_url: 'https://httpbin.org/post',
  client_reference_id: null,
  client_secret: null,
  consent: null,
  consent_collection: null,
  created: 1724710536,
  currency: 'usd',
  currency_conversion: null,
  custom_fields: [],
  custom_text: {
    after_submit: null,
    shipping_address: null,
    submit: null,
    terms_of_service_acceptance: null
  },
  customer: null,
  customer_creation: 'if_required',
  customer_details: {
    address: {
      city: 'South San Francisco',
      country: 'US',
      line1: '354 Oyster Point Blvd',
      line2: null,
      postal_code: '94080',
      state: 'CA'
    },
    email: 'stripe@example.com',
    name: 'Jenny Rosen',
    phone: null,
    tax_exempt: 'none',
    tax_ids: []
  },
  customer_email: null,
  expires_at: 1724796936,
  invoice: null,
  invoice_creation: {
    enabled: false,
    invoice_data: {
      account_tax_ids: null,
      custom_fields: null,
      description: null,
      footer: null,
      issuer: null,
      metadata: {},
      rendering_options: null
    }
  },
  livemode: false,
  locale: null,
  metadata: {},
  mode: 'payment',
  payment_intent: 'pi_3PsBCHHuZqrzwWhv0c7KBWMo',
  payment_link: null,
  payment_method_collection: 'if_required',
  payment_method_configuration_details: null,
  payment_method_options: { card: { request_three_d_secure: 'automatic' } },
  payment_method_types: [ 'card' ],
  payment_status: 'paid',
  phone_number_collection: { enabled: false },
  recovered_from: null,
  saved_payment_method_options: null,
  setup_intent: null,
  shipping_address_collection: null,
  shipping_cost: null,
  shipping_details: null,
  shipping_options: [],
  status: 'complete',
  submit_type: null,
  subscription: null,
  success_url: 'https://httpbin.org/post',
  total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
  ui_mode: 'hosted',
  url: null
}
paymentIntent infos :  {
  address: {
    city: 'San Francisco',
    country: 'US',
    line1: '510 Townsend St',
    line2: null,
    postal_code: '94103',
    state: 'CA'
  },
  carrier: null,
  name: 'Jenny Rosen',
  phone: null,
  tracking_number: null
}
  */

  }

  @Post("webhook")
  stuartWebhook( @Req() req: Request, @Res() res: Response ) {
    console.log("hook", req.body);
    res.status(HttpStatus.OK).json({
      "status": "received webhook event from stripe"
    });
  }

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
