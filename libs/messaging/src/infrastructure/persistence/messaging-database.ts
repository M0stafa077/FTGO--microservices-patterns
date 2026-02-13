import type { Kysely } from 'kysely';

import type { MessagingTables } from './messaging-tables.js';

export interface MessagingDatabase {
  current(): Kysely<MessagingTables>;
}
export const MessagingDatabase = Symbol('MessagingDatabase');
