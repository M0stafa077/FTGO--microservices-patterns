import type { Kysely } from 'kysely';

import type { ConsumerTables } from './consumer-tables.js';

export interface ConsumerDatabase {
  current(): Kysely<ConsumerTables>;
}
export const ConsumerDatabase = Symbol('ConsumerDatabase');
