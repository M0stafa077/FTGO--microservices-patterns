import { ResourceNotFound } from '@ftgo/common';

import type { DeliveryId } from '../entities/delivery-id.js';

export class DeliveryNotFound extends ResourceNotFound {
  public constructor(id: DeliveryId) {
    super('delivery.not_found', `Delivery ${id.toString()} does not exist.`);
  }
}
