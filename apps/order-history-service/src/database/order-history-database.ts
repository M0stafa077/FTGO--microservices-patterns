import type { Kysely } from 'kysely';

import type { OrderHistoryTables } from './order-history-tables.js';

export interface OrderHistoryDatabase {
  current(): Kysely<OrderHistoryTables>;
}
export const OrderHistoryDatabase = Symbol('OrderHistoryDatabase');
