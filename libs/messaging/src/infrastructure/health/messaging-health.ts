import { ServiceUnavailable } from '@ftgo/common';
import { Injectable } from '@nestjs/common';

import { KafkaMessageBroker } from '../kafka/kafka-message-broker.js';
import { KafkaSubscriber } from '../kafka/kafka-subscriber.js';
import { OutboxRelay } from '../relay/outbox-relay.js';

@Injectable()
export class MessagingHealth {
  public constructor(
    private readonly broker: KafkaMessageBroker,
    private readonly subscriber: KafkaSubscriber,
    private readonly relay: OutboxRelay,
  ) {}

  public verify(): void {
    if (!this.broker.isReady() || !this.subscriber.isReady() || !this.relay.isHealthy()) {
      throw new ServiceUnavailable(
        'messaging.unavailable',
        'Kafka is not reachable, or the outbox relay cannot publish.',
      );
    }
  }
}
