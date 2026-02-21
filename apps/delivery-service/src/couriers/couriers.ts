import type { CourierId } from './entities/courier-id.js';
import type { Courier } from './entities/courier.entity.js';

export interface Couriers {
  findById(id: CourierId): Promise<Courier | undefined>;

  getById(id: CourierId): Promise<Courier>;

  addIfAbsent(courier: Courier): Promise<void>;

  update(courier: Courier): Promise<void>;
}
export const Couriers = Symbol('Couriers');
