import type { ConsumerId } from './entities/consumer-id.js';
import type { OrderId } from './entities/order-id.js';
import type { AuthorizationView } from './schemas/authorization-view.schema.js';

export interface Authorizations {
  find(
    consumerId: ConsumerId,
    orderId: OrderId,
    authorization: string,
  ): Promise<AuthorizationView | undefined>;
}
export const Authorizations = Symbol('Authorizations');
