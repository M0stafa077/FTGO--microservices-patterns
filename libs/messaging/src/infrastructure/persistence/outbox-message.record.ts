import type { Insertable } from 'kysely';

import { HeaderName } from '../../envelope/header-name.js';
import type { OutgoingMessage } from '../../envelope/outgoing-message.js';

import type { MessageEnvelope } from './message-envelope.js';
import type { OutboxMessagesTable } from './tables/outbox-messages.table.js';

export class OutboxMessageRecord {
  private constructor(
    private readonly message: OutgoingMessage,
    private readonly envelope: MessageEnvelope,
  ) {}

  public static from(message: OutgoingMessage, envelope: MessageEnvelope): OutboxMessageRecord {
    return new OutboxMessageRecord(message, envelope);
  }

  public toRow(): Insertable<OutboxMessagesTable> {
    const headers = this.message.headers
      .with(HeaderName.MessageId, this.envelope.messageId)
      .with(HeaderName.Timestamp, this.envelope.createdAt.toISOString())
      .with(HeaderName.CorrelationId, this.envelope.correlationId)
      .including(this.envelope.traceHeaders);
    return {
      id: this.envelope.messageId,
      topic: this.message.channel,
      partitionKey: this.message.key,
      type: headers.get(HeaderName.Type),
      headers: JSON.stringify(headers.toRecord()),
      payload: JSON.stringify(this.message.payload),
      createdAt: this.envelope.createdAt,
    };
  }
}
