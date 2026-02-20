import { ResourceNotFound } from '@ftgo/common';

import type { OrderId } from '../entities/order-id.js';

export class AuthorizationNotFound extends ResourceNotFound {
  public constructor(orderId: OrderId) {
    super('authorization.not_found', `Order ${orderId.toString()} has no authorization.`);
  }
}
