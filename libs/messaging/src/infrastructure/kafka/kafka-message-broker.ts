import { KafkaJS } from '@confluentinc/kafka-javascript';
import { ServiceUnavailable } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import type { BrokerMessage } from '../broker/broker-message.js';
import type { MessageBroker } from '../broker/message-broker.js';
import { ALL_REPLICAS_ACK, PRODUCER_SEND_TIMEOUT_MS } from '../infrastructure.constants.js';

@Injectable()
export class KafkaMessageBroker implements MessageBroker {
  private producer: KafkaJS.Producer | undefined;

  public constructor(@Inject(KafkaJS.Kafka) private readonly kafka: KafkaJS.Kafka) {}

  public async connect(): Promise<void> {
    const producer = this.kafka.producer({
      'message.timeout.ms': PRODUCER_SEND_TIMEOUT_MS,
      kafkaJS: { acks: ALL_REPLICAS_ACK, idempotent: true },
    });
    await producer.connect();
    this.producer = producer;
  }

  public isReady(): boolean {
    return this.producer !== undefined;
  }

  public async publish(messages: ReadonlyArray<BrokerMessage>): Promise<void> {
    const { producer } = this;
    if (producer === undefined) {
      throw new ServiceUnavailable('kafka.unavailable', 'The Kafka producer is not connected yet.');
    }
    try {
      await producer.sendBatch({
        topicMessages: messages.map((message) => ({
          topic: message.topic,
          messages: [{ key: message.key, value: message.value, headers: { ...message.headers } }],
        })),
      });
    } catch (error) {
      throw new ServiceUnavailable('kafka.unavailable', 'Kafka did not acknowledge the messages.', {
        cause: error,
      });
    }
  }

  public async disconnect(): Promise<void> {
    const { producer } = this;
    this.producer = undefined;
    await producer?.disconnect();
  }
}
