import type { OrderId } from './entities/order-id.js';
import type { DeliveryView } from './schemas/delivery-view.schema.js';

export interface Deliveries {
  findByOrderId(orderId: OrderId, authorization: string): Promise<DeliveryView | undefined>;
}
export const Deliveries = Symbol('Deliveries');
