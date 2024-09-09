import { Test, TestingModule } from '@nestjs/testing';
import { Rabbitmq } from './rabbitmq';

describe('Rabbitmq', () => {
  let provider: Rabbitmq;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Rabbitmq],
    }).compile();

    provider = module.get<Rabbitmq>(Rabbitmq);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
