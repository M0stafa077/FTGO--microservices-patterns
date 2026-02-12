import type { ConsumersTable } from './tables/consumers.table.js';
import type { SessionsTable } from './tables/sessions.table.js';

export interface ConsumerTables {
  consumers: ConsumersTable;
  sessions: SessionsTable;
}
