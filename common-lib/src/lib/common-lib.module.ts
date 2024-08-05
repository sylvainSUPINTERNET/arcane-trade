import { Module } from '@nestjs/common';
import { CommonLibService } from './common-lib.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Topping, ToppingSchema } from './schemas/topping.schema';


@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env["MONGODB_URL"] as string),
    MongooseModule.forFeature([{ name: Topping.name, schema: ToppingSchema }])
  ],
  controllers: [],
  providers: [CommonLibService],
  exports: [CommonLibService, MongooseModule],
})

export class CommonLibModule {}
