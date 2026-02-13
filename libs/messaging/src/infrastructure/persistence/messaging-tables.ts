import type { OutboxMessagesTable } from './tables/outbox-messages.table.js';
import type { ProcessedMessagesTable } from './tables/processed-messages.table.js';

export interface MessagingTables {
  outboxMessages: OutboxMessagesTable;
  processedMessages: ProcessedMessagesTable;
}
