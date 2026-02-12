import type { Kysely } from 'kysely';

import type { ConsumerTables } from './consumer-tables.js';

export type ConsumerDatabase = Kysely<ConsumerTables>;
export const ConsumerDatabase = Symbol('ConsumerDatabase');
