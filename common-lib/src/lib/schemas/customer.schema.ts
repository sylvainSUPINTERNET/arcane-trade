import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CustomerDocument = HydratedDocument<Customer>;


@Schema({
    collection: 'customer',
    timestamps: true
})
export class Customer {

    @Prop({required: true})
    email: string | undefined;

    @Prop({required: true})
    phone: string | undefined;

    @Prop({required: true})
    fullName: string | undefined;

    @Prop({required: true})
    formulaMeal: number | undefined;

    @Prop({required: true})
    address: string | undefined;

    @Prop({required: true})
    postalCode: string | undefined;

    @Prop({required: true})
    stripeSessionId: string | undefined;

    @Prop({required: true})
    stripePaymentIntentId: string | undefined;

    @Prop({required: true})
    decision: string | undefined;

}   

export const CustomerSchema = SchemaFactory.createForClass(Customer);

