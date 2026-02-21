import { RuleViolation } from '@ftgo/common';

import type { DeliveryId } from '../entities/delivery-id.js';
import type { DeliveryState } from '../entities/delivery-state.js';

export class IllegalStateTransition extends RuleViolation {
  public constructor(id: DeliveryId, from: DeliveryState, to: DeliveryState) {
    super(
      'delivery.illegal_state_transition',
      `Delivery ${id.toString()} cannot move from ${from} to ${to}.`,
    );
  }
}
