import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TelegramDecisionHistoryDocument = HydratedDocument<TelegramDecisionHistory>;


@Schema({
    collection: 'telegramDecisionHistory',
    timestamps: true
})
export class TelegramDecisionHistory {

  @Prop({required: true})
  paymentIntentId: string | undefined;

  @Prop({required: true})
  decision: string | undefined;
}



export const TelegramDecisionHistorySchema = SchemaFactory.createForClass(TelegramDecisionHistory);