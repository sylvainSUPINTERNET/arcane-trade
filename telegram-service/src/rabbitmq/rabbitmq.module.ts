import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMqService } from './rabbitmq.service';


export interface RabbitMqConfig {
    url:string;
}

@Global()
@Module({})
export class RabbitmqModule {
    static forRoot(options: RabbitMqConfig): DynamicModule {
        return {
            module: RabbitmqModule,
            global: true,
            imports: [
                ConfigModule.forRoot(),
            ],
            providers: [
                {
                    provide: "CONFIG_OPTIONS",
                    useFactory: (configService: ConfigService) => {
                        //Logger.log('Rabbitmq instance created ' + configService.get<string>('RABBITMQ_URL'), 'Rabbitmq');
                        return (
                            options || {
                              url: configService.get<string>('RABBITMQ_URL'),
                            }
                        );
                    },
                    inject: [ConfigService]
                },
                RabbitMqService
            ],
            exports: [
                RabbitMqService,
            ]
        }
    }

}
