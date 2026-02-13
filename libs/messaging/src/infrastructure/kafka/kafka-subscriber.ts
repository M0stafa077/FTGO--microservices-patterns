import { KafkaJS } from '@confluentinc/kafka-javascript';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { PARTITIONS_CONSUMED_CONCURRENTLY } from '../infrastructure.constants.js';
import { MessagingOptions } from '../messaging-options.js';
import { Delivery } from '../receiving/delivery.js';
import { MessageDispatcher } from '../receiving/message-dispatcher.js';
import { MessageHandlers } from '../receiving/message-handlers.js';

import { KafkaHeaders } from './kafka-headers.js';
import { KafkaPartitionControl } from './kafka-partition-control.js';
import { RetryTimers } from './retry-timers.js';

@Injectable()
export class KafkaSubscriber {
  private readonly logger = new Logger(KafkaSubscriber.name);
  private readonly headers = new KafkaHeaders();
  private readonly timers = new RetryTimers();
  private consumer: KafkaJS.Consumer | undefined;

  public constructor(
    @Inject(KafkaJS.Kafka) private readonly kafka: KafkaJS.Kafka,
    @Inject(MessagingOptions) private readonly options: MessagingOptions,
    private readonly handlers: MessageHandlers,
    private readonly dispatcher: MessageDispatcher,
  ) {}

  public hasSubscriptions(): boolean {
    return this.handlers.channels().length > 0;
  }

  public isReady(): boolean {
    return !this.hasSubscriptions() || this.consumer !== undefined;
  }

  public async start(): Promise<void> {
    const consumer = this.kafka.consumer({
      kafkaJS: { groupId: this.options.serviceName, fromBeginning: true, autoCommit: false },
    });
    try {
      await consumer.connect();
      await consumer.subscribe({ topics: [...this.handlers.channels()] });
      await consumer.run({
        partitionsConsumedConcurrently: PARTITIONS_CONSUMED_CONCURRENTLY,
        eachMessage: async (payload) => this.receive(consumer, payload),
      });
    } catch (error) {
      await this.abandon(consumer);
      throw error;
    }
    this.consumer = consumer;
  }

  public async stop(): Promise<void> {
    this.timers.cancelAll();
    const { consumer } = this;
    this.consumer = undefined;
    await consumer?.disconnect();
  }

  private async abandon(consumer: KafkaJS.Consumer): Promise<void> {
    try {
      await consumer.disconnect();
    } catch (error) {
      this.logger.warn({ err: error }, 'could not close a Kafka consumer that failed to start');
    }
  }

  private async receive(
    consumer: KafkaJS.Consumer,
    payload: KafkaJS.EachMessagePayload,
  ): Promise<void> {
    const disposition = await this.dispatcher.dispatch(this.deliveryOf(payload));
    try {
      await disposition.settle(new KafkaPartitionControl(consumer, payload, this.timers));
    } catch (error) {
      this.logger.warn(
        { err: error, topic: payload.topic, partition: payload.partition },
        'could not commit the offset; the message may arrive again and will be deduplicated',
      );
    }
  }

  private deliveryOf(payload: KafkaJS.EachMessagePayload): Delivery {
    const { message } = payload;
    return new Delivery(
      { topic: payload.topic, partition: payload.partition, offset: message.offset },
      message.key?.toString('utf8') ?? null,
      message.value?.toString('utf8') ?? null,
      this.headers.decode(message.headers),
    );
  }
}
