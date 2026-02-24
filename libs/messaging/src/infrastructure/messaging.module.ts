import { KafkaJS } from '@confluentinc/kafka-javascript';
import { Module, type DynamicModule, type Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { Outbox } from '../outbox.js';

import { MessageBroker } from './broker/message-broker.js';
import { MessagingHealth } from './health/messaging-health.js';
import { KafkaLogger } from './kafka/kafka-logger.js';
import { KafkaMessageBroker } from './kafka/kafka-message-broker.js';
import { KafkaSubscriber } from './kafka/kafka-subscriber.js';
import { MessagingLifecycle } from './messaging-lifecycle.js';
import { MessagingOptions } from './messaging-options.js';
import { PostgresOutbox } from './persistence/postgres-outbox.js';
import { PostgresProcessedMessages } from './persistence/postgres-processed-messages.js';
import { ProcessedMessages } from './persistence/processed-messages.js';
import { EffectivelyOnce } from './receiving/effectively-once.js';
import { DeadLetterFailure } from './receiving/failures/dead-letter-failure.js';
import { DeadLetters } from './receiving/failures/dead-letters.js';
import { FailureHandlings } from './receiving/failures/failure-handlings.js';
import { FailureReply } from './receiving/failures/failure-reply.js';
import { HandlerBackoff } from './receiving/failures/handler-backoff.js';
import { LimitedRetryFailure } from './receiving/failures/limited-retry-failure.js';
import { RetryForeverFailure } from './receiving/failures/retry-forever-failure.js';
import { MessageDispatcher } from './receiving/message-dispatcher.js';
import { MessageHandlers } from './receiving/message-handlers.js';
import { OutboxBatches } from './relay/outbox-batches.js';
import { OutboxRelay } from './relay/outbox-relay.js';
import { RetentionCleanup } from './relay/retention-cleanup.js';
import { MessageTracing } from './tracing/message-tracing.js';
import { TracingMessageBroker } from './tracing/tracing-message-broker.js';
import { PayloadSchemas } from './validation/payload-schemas.js';

@Module({})
export class MessagingModule {
  public static with(options: MessagingOptions): DynamicModule {
    return {
      module: MessagingModule,
      global: true,
      imports: [DiscoveryModule],
      providers: [
        ...MessagingModule.connectionProviders(options),
        ...MessagingModule.sendingProviders(),
        ...MessagingModule.receivingProviders(),
        MessageTracing,
        MessagingHealth,
        MessagingLifecycle,
      ],
      exports: [Outbox, MessagingHealth],
    };
  }

  private static connectionProviders(options: MessagingOptions): Provider[] {
    return [
      { provide: MessagingOptions, useValue: options },
      { provide: KafkaJS.Kafka, useFactory: (): KafkaJS.Kafka => MessagingModule.kafka(options) },
      KafkaMessageBroker,
      { provide: MessageBroker, useClass: TracingMessageBroker },
    ];
  }

  private static sendingProviders(): Provider[] {
    return [
      PayloadSchemas,
      { provide: Outbox, useClass: PostgresOutbox },
      OutboxBatches,
      OutboxRelay,
      RetentionCleanup,
    ];
  }

  private static receivingProviders(): Provider[] {
    return [
      { provide: ProcessedMessages, useClass: PostgresProcessedMessages },
      MessageHandlers,
      EffectivelyOnce,
      MessageDispatcher,
      KafkaSubscriber,
      DeadLetters,
      HandlerBackoff,
      DeadLetterFailure,
      RetryForeverFailure,
      LimitedRetryFailure,
      FailureReply,
      FailureHandlings,
    ];
  }

  private static kafka(options: MessagingOptions): KafkaJS.Kafka {
    const { kafka } = options.config;
    return new KafkaJS.Kafka({
      kafkaJS: {
        brokers: [...kafka.brokers],
        clientId: kafka.clientId ?? options.serviceName,
        connectionTimeout: kafka.connectionTimeout.toMilliseconds(),
        logger: new KafkaLogger(),
        logLevel: KafkaJS.logLevel.WARN,
      },
    });
  }
}
