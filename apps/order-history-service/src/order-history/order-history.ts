import type { OrderHistoryEntry } from './entities/order-history-entry.entity.js';
import type { OrderId } from './entities/order-id.js';
import type { HistoryCriteria } from './history-criteria.js';
import type { HistoryPage } from './history-page.js';

export interface OrderHistory {
  getById(id: OrderId): Promise<OrderHistoryEntry>;

  add(entry: OrderHistoryEntry): Promise<void>;

  update(entry: OrderHistoryEntry): Promise<void>;

  search(criteria: HistoryCriteria): Promise<HistoryPage>;
}
export const OrderHistory = Symbol('OrderHistory');
