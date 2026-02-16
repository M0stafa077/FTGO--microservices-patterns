import type { OrderId } from './entities/order-id.js';
import type { Order } from './entities/order.entity.js';

export interface Orders {
  findById(id: OrderId): Promise<Order | undefined>;

  add(order: Order): Promise<void>;
}
export const Orders = Symbol('Orders');
