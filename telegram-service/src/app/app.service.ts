import { Injectable, Logger } from '@nestjs/common';
import axios from "axios";
import { IPaymentIntentConfirmRequestPayload } from './app.controller';




@Injectable()
export class AppService {

  async sendMessagePaymentIntentConfirm( payload:IPaymentIntentConfirmRequestPayload ) {
    
    const telegramBotToken =  process.env.TELEGRAM_BOT_ACCESS_TOKEN as string;

    const chat_id = process.env.TELEGRAM_CHAT_ID as string;
    const text = `Do you want to accept the delivery ? \n\n${payload.data.paymentIntentId} - \n\n ${JSON.stringify(payload.data)}`;

    try {

      const response = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        chat_id,
        text,
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Yes', callback_data:  `yes@${payload.data.paymentIntentId}` },
              { text: 'No', callback_data: `no@${payload.data.paymentIntentId}` }
            ]
          ]
        }
      });
      // Logger.log('Prompt sent:', response.data);      
    } catch (error) {
      Logger.error('Error sending prompt:', error);
    }
  }

  async sendMessagePaymentIntentResponse( payload : "Confirmed" | "Cancel", paymentId: string ) {
    const telegramBotToken =  process.env.TELEGRAM_BOT_ACCESS_TOKEN as string;

    const chat_id = process.env.TELEGRAM_CHAT_ID as string;
    const text = `Delivery :  ${payload} - ${paymentId}`;

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
