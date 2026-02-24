import { Clock } from '@ftgo/common';
import { CorrelationScope, PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import type { OutgoingMessage } from '../../envelope/outgoing-message.js';
import type { Outbox } from '../../outbox.js';
import { MessageTracing } from '../tracing/message-tracing.js';
import { PayloadSchemas } from '../validation/payload-schemas.js';

import { MessagingDatabase } from './messaging-database.js';
import { OutboxMessageRecord } from './outbox-message.record.js';

@Injectable()
export class PostgresOutbox implements Outbox {
  public constructor(
    @Inject(MessagingDatabase) private readonly database: MessagingDatabase,
    @Inject(Clock) private readonly clock: Clock,
    private readonly correlation: CorrelationScope,
    private readonly payloads: PayloadSchemas,
    private readonly tracing: MessageTracing,
  ) {}

  public async append(message: OutgoingMessage): Promise<void> {
    this.payloads.validate(message.schema, message.payload);
    const { messageId } = message;
    const correlationId = this.correlation.current() ?? messageId;
    const record = OutboxMessageRecord.from(message, {
      messageId,
      createdAt: this.clock.now(),
      correlationId,
      traceHeaders: this.tracing.created(message, messageId, correlationId),
    });
    try {
      await this.database.current().insertInto('outboxMessages').values(record.toRow()).execute();
    } catch (error) {
      PostgresFailure.of(error).rethrow('append to outbox');
    }
  }
}
