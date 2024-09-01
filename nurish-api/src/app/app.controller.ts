import { Controller, Get, HttpCode } from '@nestjs/common';

import { AppService } from './app.service';
import Stripe from 'stripe';

@Controller(
  "/stripe"
)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/products")
  async getProducts() {      
    return await this.appService.getProducts();
  }


  @Get("/health")
  @HttpCode(200)
  async getHealth() {
    return "OK";
  }


}
