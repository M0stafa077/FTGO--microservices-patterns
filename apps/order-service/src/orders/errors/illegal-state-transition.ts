import { RuleViolation } from '@ftgo/common';

import type { OrderId } from '../entities/order-id.js';
import type { OrderState } from '../entities/order-state.js';

export class IllegalStateTransition extends RuleViolation {
  public constructor(id: OrderId, from: OrderState, to: OrderState) {
    super(
      'order.illegal_state_transition',
      `Order ${id.toString()} cannot move from ${from} to ${to}.`,
    );
  }
}
