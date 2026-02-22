import type { OrderId } from './entities/order-id.js';
import type { OrderView } from './schemas/order-view.schema.js';

export interface Orders {
  getById(id: OrderId, authorization: string): Promise<OrderView>;
}
export const Orders = Symbol('Orders');
