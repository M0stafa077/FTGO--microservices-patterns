import type { Kysely } from 'kysely';

import type { SagaTables } from './saga-tables.js';

export interface SagaDatabase {
  current(): Kysely<SagaTables>;
}
export const SagaDatabase = Symbol('SagaDatabase');
