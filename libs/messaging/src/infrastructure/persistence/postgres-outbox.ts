import { Clock } from '@ftgo/common';
import { CorrelationScope, PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import type { OutgoingMessage } from '../../envelope/outgoing-message.js';
import type { Outbox } from '../../outbox.js';
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
  ) {}

  public async append(message: OutgoingMessage): Promise<void> {
    this.payloads.validate(message.schema, message.payload);
    const record = OutboxMessageRecord.from(message, {
      messageId: message.messageId,
      createdAt: this.clock.now(),
      correlationId: this.correlation.current() ?? message.messageId,
    });
    try {
      await this.database.current().insertInto('outboxMessages').values(record.toRow()).execute();
    } catch (error) {
      PostgresFailure.of(error).rethrow('append to outbox');
    }
  }
}
