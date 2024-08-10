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


  async createNewJob(paymentIntentData: Stripe.PaymentIntent){

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
            client_reference: uuidv7(), // must be unique
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
    .then((apiResponse) => { console.log("JOB ", apiResponse.body, apiResponse.body.deliveries[0].tracking_url) })
    .catch((error) => { console.log(error) })
    
    // httpClient.performGet('/v2/jobs')
    // .then((apiResponse) => { console.log(apiResponse) })
    // .catch((error) => { console.log(error) })

    
  }

}
