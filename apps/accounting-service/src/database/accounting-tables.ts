import type { MessagingTables } from '@ftgo/messaging/infrastructure';

import type { AccountsTable } from './tables/accounts.table.js';
import type { AuthorizationsTable } from './tables/authorizations.table.js';

export interface AccountingTables extends MessagingTables {
  accounts: AccountsTable;
  authorizations: AuthorizationsTable;
}
