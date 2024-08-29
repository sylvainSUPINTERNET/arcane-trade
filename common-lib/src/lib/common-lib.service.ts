import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { TelegramDecisionHistory } from "./schemas/telegramDecisionHistory.schema";
import { Model } from "mongoose";
import { MappingSesionIdStripe } from "./schemas/mappingSessionIdStripe.schema";
import { Customer } from "./schemas/customer.schema";

@Injectable()
export class CommonLibService { 

    constructor(@InjectModel(TelegramDecisionHistory.name) private telegramHistoryModel: Model<TelegramDecisionHistory>,
                @InjectModel(MappingSesionIdStripe.name) private mappingSesionIdStripeModel:Model<MappingSesionIdStripe>,
                @InjectModel(Customer.name) private customerModel:Model<Customer>,

            ) { }

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
        await this.mappingSesionIdStripeModel.create({ shortId, sessionId });
    }

    async getSessionIdFromTelegramFitIdMapSessionId( shortId: string ) {
        const data = await this.mappingSesionIdStripeModel.findOne({ shortId });
        return data;
    }

    async saveCustomer( customerData: {
        email: string,
        phone: string,
        fullName: string,
        formulaMeal: number,
        address: string,
        postalCode: string,
        stripeSessionId: string,
        stripePaymentIntentId: string
    } ) {
        await this.customerModel.create(customerData);
    }
}
