import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {

  constructor(@Inject('REDIS_CLIENT') private readonly client: ClientProxy) {
  }
  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}
