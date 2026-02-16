import { ResourceNotFound } from '@ftgo/common';

import type { OrderId } from '../entities/order-id.js';

export class OrderNotFound extends ResourceNotFound {
  public constructor(id: OrderId) {
    super('order.not_found', `Order ${id.toString()} does not exist.`);
  }
}
