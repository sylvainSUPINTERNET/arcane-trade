import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { InjectModel } from '@nestjs/mongoose';
import { Topping } from 'common-lib/src/lib/schemas/topping.schema';
import { Model } from 'mongoose';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectModel(Topping.name) private toppingModel: Model<Topping>
  ) { }

  @Get()
  async getData() {
    // const d = new this.toppingModel({
    //   "name":"test"
    // })
    // const result = await d.save();
    // console.log(result);

    return this.appService.getData();
  }
}
