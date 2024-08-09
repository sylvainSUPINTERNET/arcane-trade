import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { TelegramDecisionHistory } from "./schemas/telegramDecisionHistory.schema";
import { Model } from "mongoose";

@Injectable()
export class CommonLibService { 

    constructor(@InjectModel(TelegramDecisionHistory.name) private telegramHistoryModel: Model<TelegramDecisionHistory>) { }

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
}