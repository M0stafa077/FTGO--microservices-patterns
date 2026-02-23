import { ResourceNotFound } from '@ftgo/common';

import type { OrderId } from '../entities/order-id.js';

export class EntryNotFound extends ResourceNotFound {
  public constructor(id: OrderId) {
    super('order_history.entry_not_found', `Order ${id.toString()} has no history entry.`);
  }
}
