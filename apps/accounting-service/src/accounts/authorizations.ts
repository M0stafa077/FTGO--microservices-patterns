import type { Authorization } from './entities/authorization.entity.js';
import type { OrderId } from './entities/order-id.js';

export interface Authorizations {
  findById(orderId: OrderId): Promise<Authorization | undefined>;

  add(authorization: Authorization): Promise<void>;
}
export const Authorizations = Symbol('Authorizations');
