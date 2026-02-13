import type { MessagingTables } from '@ftgo/messaging/infrastructure';

import type { ConsumersTable } from './tables/consumers.table.js';
import type { SessionsTable } from './tables/sessions.table.js';

export interface ConsumerTables extends MessagingTables {
  consumers: ConsumersTable;
  sessions: SessionsTable;
}
