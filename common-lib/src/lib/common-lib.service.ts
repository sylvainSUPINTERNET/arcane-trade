import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { TelegramDecisionHistory } from "./schemas/telegramDecisionHistory.schema";
import { Model } from "mongoose";
import { MappingSesionIdStripe } from "./schemas/mappingSessionIdStripe.schema";

@Injectable()
export class CommonLibService { 

    constructor(@InjectModel(TelegramDecisionHistory.name) private telegramHistoryModel: Model<TelegramDecisionHistory>,

                @InjectModel(MappingSesionIdStripe.name) private mappingSesionIdStripeSchema:Model<MappingSesionIdStripe>) { }

    private readonly message: string = `Hello from ${CommonLibService.name}`;

    getHello(): string {
        return this.message;
    } 

    async saveDicisionHistory( decision: string, paymentIntentId: string ) {
        await this.telegramHistoryModel.create({ decision, paymentIntentId });
    }

    async getDecisionHistory( paymentIntentId: string ) {
        const data = await this.telegramHistoryModel.findOne({ paymentIntentId });

        return data;
    }

    async saveTelegramFitIdMapSessionId( shortId: string, sessionId: string ) {
        await this.mappingSesionIdStripeSchema.create({ shortId, sessionId });
    }

    async getSessionIdFromTelegramFitIdMapSessionId( shortId: string ) {
        const data = await this.mappingSesionIdStripeSchema.findOne({ shortId });
        return data;
    }
}