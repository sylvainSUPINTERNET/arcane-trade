import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MappingSesionIdStripeDocument = HydratedDocument<MappingSesionIdStripe>;


@Schema({
    collection: 'mappingsessionidstripe',
    timestamps: true
})
export class MappingSesionIdStripe {

    @Prop({required: true})
    shortId: string | undefined;

    @Prop({required: true})
    sessionId: string | undefined;
}



export const MappingSesionIdStripeSchema = SchemaFactory.createForClass(MappingSesionIdStripe);
MappingSesionIdStripeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
