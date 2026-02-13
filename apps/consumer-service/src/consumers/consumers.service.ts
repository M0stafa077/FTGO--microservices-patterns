import { Clock, Transactions } from '@ftgo/common';
import { Outbox } from '@ftgo/messaging';
import { Inject, Injectable } from '@nestjs/common';

import { ConsumerEventMessages } from './consumer-event-messages.js';
import { Consumers } from './consumers.js';
import type { ConsumerId } from './entities/consumer-id.js';
import { Consumer } from './entities/consumer.entity.js';
import type { EmailAddress } from './entities/email-address.js';
import type { Registration } from './entities/registration.js';
import type { Profile } from './profile.js';

@Injectable()
export class ConsumersService {
  public constructor(
    @Inject(Consumers) private readonly consumers: Consumers,
    @Inject(Transactions) private readonly transactions: Transactions,
    @Inject(Outbox) private readonly outbox: Outbox,
    private readonly eventMessages: ConsumerEventMessages,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async register(registration: Registration): Promise<Consumer> {
    return this.transactions.run(async () => {
      const consumer = Consumer.register(registration, this.clock.now());
      await this.consumers.add(consumer);
      await this.publishEventsOf(consumer);
      return consumer;
    });
  }

  public async findByEmail(email: EmailAddress): Promise<Consumer | undefined> {
    return this.consumers.findByEmail(email);
  }

  public async getProfile(consumerId: ConsumerId): Promise<Consumer> {
    return this.consumers.getById(consumerId);
  }

  public async updateProfile(consumerId: ConsumerId, profile: Profile): Promise<Consumer> {
    const consumer = await this.consumers.getById(consumerId);
    consumer.updateProfile(profile.name, profile.phoneNumber, this.clock.now());
    await this.consumers.update(consumer);
    return consumer;
  }

  public async validateOrder(consumerId: ConsumerId): Promise<void> {
    await this.consumers.getById(consumerId);
  }

  private async publishEventsOf(consumer: Consumer): Promise<void> {
    for (const event of consumer.releaseEvents()) {
      await this.outbox.append(this.eventMessages.of(event));
    }
  }
}
