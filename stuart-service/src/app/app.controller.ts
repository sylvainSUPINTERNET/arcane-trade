import { Controller, Inject, Logger } from '@nestjs/common';

import { AppService } from './app.service';
import { ClientProxy, Ctx, MessagePattern, Payload, RedisContext } from '@nestjs/microservices';

import {
  Authenticator,
  Environment,
  ApiResponse,
  HttpClient
} from 'stuart-client-js'


interface payloadWebhookPaymentStripeSucceed {
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
    }
  }
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('REDIS_CLIENT') private readonly client: ClientProxy
  ) {}


  
  @MessagePattern('webhook_payment_stripe_succeed')
  getNotification( @Payload() msg:payloadWebhookPaymentStripeSucceed, @Ctx() ctx: RedisContext ) {
    Logger.log(`STUART_SERVICE : received shipping`, msg.data.shipping);

    let environment;
    if ( process.env.STUART_ENV === 'production' ) {
      environment = Environment.PRODUCTION();
    } else {
      environment = Environment.SANDBOX();
    }
    const api_client_id = `${process.env.STUART_ID_CLIENT}` // can be found here: https://admin-sandbox.stuart.com/client/api
    const api_client_secret = `${process.env.STUART_SECRET}` // can be found here: https://admin-sandbox.stuart.com/client/api
    const auth = new Authenticator(environment, api_client_id, api_client_secret)

    const httpClient = new HttpClient(auth)
    
    const job = {
      job: {
        transport_type: "bike",
        pickups: [
          {
            address: "46 Boulevard Barbès, 75018 Paris",
            comment: "Wait outside for an employee to come.",
            contact: {
              firstname: "Martin",
              lastname: "Pont",
              phone: "+33698348756'",
              company: "KFC Paris Barbès"
            }
          }
        ],
        dropoffs: [
          {
            address: "156 rue de Charonne, 75011 Paris",
            package_description: "Red packet.",
            client_reference: "12345678ABCDE", // must be unique
            comment: "code: 3492B. 3e étage droite. Sonner à Durand.",
            contact: {
              firstname: "Alex",
              lastname: "Durand",
              phone: "+33634981209",
              company: "Durand associates."
            }
          }
        ]
      }
    }
    
    httpClient.performPost('/v2/jobs', JSON.stringify(job))
      .then((apiResponse) => { console.log(apiResponse) })
      .catch((error) => { console.log(error) })
      
    httpClient.performGet('/v2/jobs')
    .then((apiResponse) => { console.log(apiResponse) })
    .catch((error) => { console.log(error) })

    
    return msg.data;
  }


  
}
