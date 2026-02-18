import type { Kysely } from 'kysely';

import type { KitchenTables } from './kitchen-tables.js';

export interface KitchenDatabase {
  current(): Kysely<KitchenTables>;
}
export const KitchenDatabase = Symbol('KitchenDatabase');
