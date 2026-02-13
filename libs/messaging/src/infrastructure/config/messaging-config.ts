import { Duration } from '@ftgo/common';
import type { Environment } from '@ftgo/common/infrastructure';

import type { HandlerSettings } from './handler-settings.js';
import type { KafkaSettings } from './kafka-settings.js';
import type { OutboxSettings } from './outbox-settings.js';
import { MessagingEnvironment } from './schemas/messaging-environment.schema.js';

export class MessagingConfig {
  private constructor(
    public readonly kafka: KafkaSettings,
    public readonly outbox: OutboxSettings,
    public readonly handlers: HandlerSettings,
  ) {}

  public static fromEnvironment(environment: Environment): MessagingConfig {
    const variables = environment.read(MessagingEnvironment);
    return new MessagingConfig(
      {
        brokers: variables.KAFKA_BROKERS.split(','),
        clientId: variables.KAFKA_CLIENT_ID,
        connectionTimeout: Duration.ofMilliseconds(variables.KAFKA_CONNECTION_TIMEOUT_MS),
      },
      {
        pollInterval: Duration.ofMilliseconds(variables.OUTBOX_POLL_INTERVAL_MS),
        batchSize: variables.OUTBOX_BATCH_SIZE,
        retention: Duration.ofDays(variables.OUTBOX_RETENTION_DAYS),
      },
      {
        maxAttempts: variables.HANDLER_MAX_ATTEMPTS,
        maxBackoff: Duration.ofMilliseconds(variables.HANDLER_MAX_BACKOFF_MS),
        processedMessagesRetention: Duration.ofDays(variables.PROCESSED_MESSAGES_RETENTION_DAYS),
      },
    );
  }
}
