import { Inject, Injectable, Logger } from "@nestjs/common";
import { RabbitMqConfig } from "./rabbitmq.module";



@Injectable()
export class RabbitMqService {
    constructor(@Inject('CONFIG_OPTIONS') private options: RabbitMqConfig) {
        Logger.log('Rabbitmq instance created ' + options.url, 'Rabbitmq');
    }
}