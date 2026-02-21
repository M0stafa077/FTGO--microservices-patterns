import { RuleViolation } from '@ftgo/common';

import type { DeliveryId } from '../entities/delivery-id.js';

export class NoCourierAvailable extends RuleViolation {
  public constructor(id: DeliveryId) {
    super(
      'courier.none_available',
      `Delivery ${id.toString()} cannot be scheduled, because no courier is available.`,
    );
  }
}
