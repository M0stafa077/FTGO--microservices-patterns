import type { MessagingTables } from '@ftgo/messaging/infrastructure';

import type { OrderHistoryTable } from './tables/order-history.table.js';

export interface OrderHistoryTables extends MessagingTables {
  orderHistory: OrderHistoryTable;
}
