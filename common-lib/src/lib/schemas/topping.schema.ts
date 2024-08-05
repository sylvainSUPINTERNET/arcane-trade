import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ToppingDocument = HydratedDocument<Topping>;

enum Allergens {
    gluten = "gluten",
    crustaceans = "crustaceans",
    eggs = "eggs",
    fish = "fish",
    peanuts = "peanuts",
    soybeans = "soybeans",
    milk = "milk",
    nuts = "nuts",
    celery = "celery",
    mustard = "mustard",
    sesame = "sesame",
    sulphurDioxide = "sulphurDioxide",
    lupin = "lupin",
    molluscs = "molluscs"
}


@Schema({
    collection: 'toppings',
    timestamps: true
})
export class Topping {

  @Prop({required: true})
  name: string | undefined;

  @Prop({required: true})
  type: "main" | "secondary" | undefined;

  @Prop({required: true})
  calories: string | undefined;

  @Prop({required: true})
  weight: string | undefined;


  @Prop({required: true})
  quantityMaxPerMeal: number | undefined;

  @Prop({required: true})
  allergens: Allergens[] | undefined;

  @Prop({required: true})
  spicyLevel: 0 | 1 | 2 | 3 | 4 | 5 | undefined;

}

export const ToppingSchema = SchemaFactory.createForClass(Topping);