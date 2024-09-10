import { Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { RabbitMqConfig } from "./rabbitmq.module";
import * as amqp from 'amqplib';

export const orderQueue: string = 'order';


@Injectable()
export class RabbitMqService implements OnModuleDestroy  {

    amqpConnection: amqp.Connection;
    channel : amqp.Channel;

    constructor(@Inject('CONFIG_OPTIONS') private options: RabbitMqConfig) {
        this.init();
    }

    async init() {

        try {
            this.amqpConnection = await amqp.connect(this.options.url);
            this.channel = await this.amqpConnection.createChannel();

            this.channel.assertQueue(orderQueue, {durable: true});

            Logger.log(`Init connection and channel with durable queue ${orderQueue} with success', 'Rabbitmq'`);


        } catch ( e ) {
            if ( this.channel ) {
                await this.channel.close();
            }

            if ( this.amqpConnection ) {
                await this.amqpConnection.close();
            }

            Logger.error('Error while connecting to Rabbitmq', e, 'Rabbitmq');
        }
    }

    public async getChannel(): Promise<amqp.Channel> {
        if (!this.channel) {
            await this.init(); 
        }
        return this.channel;
    }


    async onModuleDestroy() {

        if ( this.channel ) {
            await this.channel.close();
        }

        if ( this.amqpConnection ) {
            await this.amqpConnection.close();
        }
    }
}