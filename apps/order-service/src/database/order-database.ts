import type { Kysely } from 'kysely';

import type { OrderTables } from './order-tables.js';

export interface OrderDatabase {
  current(): Kysely<OrderTables>;
}
export const OrderDatabase = Symbol('OrderDatabase');
