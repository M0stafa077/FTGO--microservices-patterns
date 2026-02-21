import type { DeliveryId } from './entities/delivery-id.js';
import type { Delivery } from './entities/delivery.entity.js';

export interface Deliveries {
  findById(id: DeliveryId): Promise<Delivery | undefined>;

  getById(id: DeliveryId): Promise<Delivery>;

  add(delivery: Delivery): Promise<void>;

  update(delivery: Delivery): Promise<void>;
}
export const Deliveries = Symbol('Deliveries');
