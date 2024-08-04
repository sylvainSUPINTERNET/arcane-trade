import { CommonLibService } from '@arcane-trade/common-lib';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  
  constructor(private readonly commonLibService: CommonLibService) {}

  getData(): { message: string } {

    return { message: this.commonLibService.getHello() };
  }
}
