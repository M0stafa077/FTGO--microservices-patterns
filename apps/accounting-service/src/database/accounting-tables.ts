import type { MessagingTables } from '@ftgo/messaging/infrastructure';

import type { AccountEventsTable } from './tables/account-events.table.js';

export interface AccountingTables extends MessagingTables {
  accountEvents: AccountEventsTable;
}
