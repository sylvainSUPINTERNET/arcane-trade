import { Get, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Stripe } from "stripe";

import {
  Authenticator,
  Environment,
  ApiResponse,
  HttpClient
} from 'stuart-client-js';

import { v7 as uuidv7 } from 'uuid';


@Injectable()
export class AppService {

  constructor(@Inject('REDIS_CLIENT') private readonly client: ClientProxy) { }


  async createNewJob(paymentIntentData: Stripe.PaymentIntent, sessionData: Stripe.Checkout.Session) {

    let environment;
    if ( process.env.STUART_ENV === 'production' ) {
      environment = Environment.PRODUCTION();
    } else {
      environment = Environment.SANDBOX();
    }

    const api_client_id = `${process.env.STUART_ID_CLIENT}` // can be found here: https://admin-sandbox.stuart.com/client/api
    const api_client_secret = `${process.env.STUART_SECRET}` // can be found here: https://admin-sandbox.stuart.com/client/api
    const auth = new Authenticator(environment, api_client_id, api_client_secret)

    const httpClient = new HttpClient(auth); 

    console.log("STUART SESSION DATA : " , sessionData)
    console.log("STUART PAYMENT DATA : " , paymentIntentData)

    const job = {
      job: {
        transport_type: "bike", // TODO calculate the best transport type based on the lat / lon
        pickups: [
          {
            address: `${process.env.STUART_PICKUP_ADDRESS}`,
            comment: `${process.env.STUART_PICKUP_COMMENT}`,
            contact: {
              firstname: `${process.env.STUART_PICKUP_CONTACT_FIRSTNAME}`,
              lastname:  `${process.env.STUART_PICKUP_CONTACT_LASTNAME}`,
              phone: `${process.env.STUART_PICKUP_CONTACT_PHONE}`,
              company: `${process.env.STUART_PICKUP_CONTACT_COMPANY}`
            }
          }
        ],
        dropoffs: [
          {
            address: `${paymentIntentData.shipping.address!.line1}, ${paymentIntentData.shipping.address!.postal_code} ${paymentIntentData.shipping.address!.city}`, // "156 rue de Charonne, 75011 Paris"
            package_description: "Nurish box",
            client_reference: uuidv7(), // must be unique
            comment: `Call for ${sessionData.customer_details.phone}`,
            contact: {
              firstname: `${sessionData.customer_details.name}`, // can't make diff between firstname / lastname with stripe !
              lastname: `${sessionData.customer_details.name}`, // so we take full name no choice ..
              phone: `${sessionData.customer_details.phone}`,
              company: `${sessionData.customer_details.name}`
            }
          }
        ]
      }
    }
    
    httpClient.performPost('/v2/jobs', JSON.stringify(job))
    .then((apiResponse) => { 
      const { body } = apiResponse
      console.log("JOB ", apiResponse.body, apiResponse.body.deliveries[0].tracking_url)

      // send SMS
      const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
      const authToken = process.env.TWILIO_AUTH_TOKEN as string;
      const client = require('twilio')(accountSid, authToken);
      client.messages
          .create({
              body: `Commande en cours de préparation, suivez votre livraison : ${apiResponse.body.deliveries[0].tracking_url}`,
              messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE as string,
              to: `${sessionData.customer_details.phone}`
          })
          .then(message => console.log(message.sid))
          .catch(error => { console.log(error) });



      this.client.emit('stuart_job_tracking_link', { tracking_url: body.deliveries[0].tracking_url , paymentIntentId: paymentIntentData.id, sessionId: sessionData.id })
     })
    .catch((error) => { console.log(error) })
    
    // httpClient.performGet('/v2/jobs')
    // .then((apiResponse) => { console.log(apiResponse) })
    // .catch((error) => { console.log(error) })

    
  }

}



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