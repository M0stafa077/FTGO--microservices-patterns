import { Clock } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import { Consumers } from './consumers.js';
import type { ConsumerId } from './entities/consumer-id.js';
import type { Consumer } from './entities/consumer.entity.js';
import type { Profile } from './profile.js';

@Injectable()
export class ConsumersService {
  public constructor(
    @Inject(Consumers) private readonly consumers: Consumers,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async getProfile(consumerId: ConsumerId): Promise<Consumer> {
    return this.consumers.getById(consumerId);
  }

  public async updateProfile(consumerId: ConsumerId, profile: Profile): Promise<Consumer> {
    const consumer = await this.consumers.getById(consumerId);
    consumer.updateProfile(profile.name, profile.phoneNumber, this.clock.now());
    await this.consumers.update(consumer);
    return consumer;
  }
}
