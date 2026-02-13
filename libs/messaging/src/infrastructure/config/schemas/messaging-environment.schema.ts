import { Type, type Static } from 'typebox';

export const MessagingEnvironment = Type.Object({
  KAFKA_BROKERS: Type.String({
    pattern: '^[A-Za-z0-9.-]+:[0-9]{1,5}(,[A-Za-z0-9.-]+:[0-9]{1,5})*$',
    maxLength: 2048,
    default: 'localhost:9092',
  }),
  KAFKA_CLIENT_ID: Type.Optional(Type.String({ pattern: '^[A-Za-z0-9._-]{1,100}$' })),
  KAFKA_CONNECTION_TIMEOUT_MS: Type.Integer({ minimum: 1_000, maximum: 60_000, default: 5_000 }),
  OUTBOX_POLL_INTERVAL_MS: Type.Integer({ minimum: 50, maximum: 60_000, default: 500 }),
  OUTBOX_BATCH_SIZE: Type.Integer({ minimum: 1, maximum: 1_000, default: 100 }),
  OUTBOX_RETENTION_DAYS: Type.Integer({ minimum: 1, maximum: 365, default: 7 }),
  PROCESSED_MESSAGES_RETENTION_DAYS: Type.Integer({ minimum: 1, maximum: 365, default: 14 }),
  HANDLER_MAX_ATTEMPTS: Type.Integer({ minimum: 1, maximum: 100, default: 5 }),
  HANDLER_MAX_BACKOFF_MS: Type.Integer({ minimum: 100, maximum: 600_000, default: 30_000 }),
});
export type MessagingEnvironment = Static<typeof MessagingEnvironment>;
