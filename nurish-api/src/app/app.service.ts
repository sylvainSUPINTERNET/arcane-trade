import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class AppService {
  async getProducts(): Promise<Stripe.ApiList<Stripe.Product>> {

    const stripe = new Stripe(process.env.STRIPE_KEY_SECRET as string)

    const data = await stripe.products.list({
      expand: ['data.default_price']
    })

    return data;
  }
}
