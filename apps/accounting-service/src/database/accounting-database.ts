import type { Kysely } from 'kysely';

import type { AccountingTables } from './accounting-tables.js';

export interface AccountingDatabase {
  current(): Kysely<AccountingTables>;
}
export const AccountingDatabase = Symbol('AccountingDatabase');
