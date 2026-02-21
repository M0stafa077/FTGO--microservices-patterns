import type { Kysely } from 'kysely';

import type { DeliveryTables } from './delivery-tables.js';

export interface DeliveryDatabase {
  current(): Kysely<DeliveryTables>;
}
export const DeliveryDatabase = Symbol('DeliveryDatabase');
