import { Injectable, Logger } from '@nestjs/common';
import axios from "axios";
import { IPaymentIntentConfirmRequestPayload } from './app.controller';
import { CommonLibService } from '@arcane-trade/common-lib';


@Injectable()
export class AppService {
  
  constructor (private readonly commonLibService: CommonLibService ) { }


  async saveResponse() {
    this.commonLibService.getHello();
  }

  async sendMessagePaymentIntentConfirm( payload:IPaymentIntentConfirmRequestPayload ) {
    
    const telegramBotToken =  process.env.TELEGRAM_BOT_ACCESS_TOKEN as string;

    const chat_id = process.env.TELEGRAM_CHAT_ID as string;
    const text = `Do you want to accept the delivery ? \n\n${payload.data.sessionId} - \n\n ${JSON.stringify(payload.data.shippingDetails)}`;

    try {

      const response = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        chat_id,
        text,
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Yes', callback_data:  `yes@${payload.data.telegramFitIdMapSessionId}` },
              { text: 'No', callback_data: `no@${payload.data.telegramFitIdMapSessionId}` }
            ]
          ]
        }
      });
      // Logger.log('Prompt sent:', response.data);      
    } catch (error) {
      Logger.error('Error sending prompt:', error);
    }
  }

  async sendMessagePaymentIntentResponse( payload : "Confirmed" | "Cancel", sessionId: string ) {
    const telegramBotToken =  process.env.TELEGRAM_BOT_ACCESS_TOKEN as string;

    const chat_id = process.env.TELEGRAM_CHAT_ID as string;
    const text = `Delivery :  ${payload} - ${sessionId}`;

    try {
      const response = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        chat_id,
        text
      });
      //Logger.log('Message sent:', response.data);      
    } catch (error) {
      Logger.error('Error sending message:', error);
    }
  }

  async sendMessageJobTrackingLink(msg: {tracking_url: string, paymentIntentId: string, sessionId: string}) {
    const telegramBotToken =  process.env.TELEGRAM_BOT_ACCESS_TOKEN as string;
    const chat_id = process.env.TELEGRAM_CHAT_ID as string;
    const text = `Tracking for :  ${msg.paymentIntentId} - ${msg.tracking_url} - ${msg.sessionId}`;
    try {
      const response = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        chat_id,
        text
      });
      //Logger.log('Message sent:', response.data);      
    } catch (error) {
      Logger.error('Error sending message:', error);
    }
  }

}
