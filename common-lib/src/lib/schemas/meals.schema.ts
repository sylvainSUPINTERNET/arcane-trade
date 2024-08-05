import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MealDocument = HydratedDocument<Meal>;


@Schema({
    collection: 'meals',
    timestamps: true
})
export class Meal {

  @Prop({required: true})
  name: string | undefined;

  @Prop({required: true})
  type: "custom" | undefined;

  @Prop({required: true})
  stripeProductId: string | undefined;

  @Prop({required: true})
  stripePriceId: string | undefined;


 // https://community.stuart.engineering/t/order-tracking-best-practice/631

  @Prop({required: true})
  phoneNumber: string | undefined; // for stuartAPI

  @Prop({required: true})
  email: string | undefined; // for stuartAPI

  @Prop({required: true})
  stuartJobId: string | undefined; // for stuartAPI

  @Prop({required: true})
  stuartTrackingUrl: string | undefined;
}



export const MealSchema = SchemaFactory.createForClass(Meal);