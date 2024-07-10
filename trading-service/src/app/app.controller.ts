import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { CommonLibService } from '@arcane-trade/common-lib';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly commonLibService: CommonLibService) {}

  @Get()
  getData() {
    console.log(this.commonLibService.getHello());
    return this.appService.getData();
  }

  
}
