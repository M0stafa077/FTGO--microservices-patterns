import type { ConsumerId } from './entities/consumer-id.js';
import type { Consumer } from './entities/consumer.entity.js';
import type { EmailAddress } from './entities/email-address.js';

export interface Consumers {
  findByEmail(email: EmailAddress): Promise<Consumer | undefined>;

  getById(id: ConsumerId): Promise<Consumer>;

  add(consumer: Consumer): Promise<void>;

  update(consumer: Consumer): Promise<void>;
}
export const Consumers = Symbol('Consumers');
