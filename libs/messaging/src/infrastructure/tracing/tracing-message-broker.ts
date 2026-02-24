import { Injectable } from '@nestjs/common';

import type { BrokerMessage } from '../broker/broker-message.js';
import type { MessageBroker } from '../broker/message-broker.js';
import { KafkaMessageBroker } from '../kafka/kafka-message-broker.js';

import { MessageTracing } from './message-tracing.js';

@Injectable()
export class TracingMessageBroker implements MessageBroker {
  public constructor(
    private readonly inner: KafkaMessageBroker,
    private readonly tracing: MessageTracing,
  ) {}

  public async publish(messages: ReadonlyArray<BrokerMessage>): Promise<void> {
    await this.tracing.sending(messages, async () => this.inner.publish(messages));
  }
}
