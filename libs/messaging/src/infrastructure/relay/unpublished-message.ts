import type { Selectable } from 'kysely';

import type { BrokerMessage } from '../broker/broker-message.js';
import type { OutboxMessagesTable } from '../persistence/tables/outbox-messages.table.js';

export class UnpublishedMessage {
  private constructor(
    public readonly id: string,
    public readonly createdAt: Date,
    public readonly brokerMessage: BrokerMessage,
  ) {}

  public static fromRow(
    row: Selectable<OutboxMessagesTable>,
    headers: Readonly<Record<string, string>>,
  ): UnpublishedMessage {
    return new UnpublishedMessage(row.id, row.createdAt, {
      topic: row.topic,
      key: row.partitionKey,
      value: JSON.stringify(row.payload),
      headers,
    });
  }
}
