import { RuleViolation } from '@ftgo/common';

import type { OrderId } from '../entities/order-id.js';

export class AuthorizationAlreadyReversed extends RuleViolation {
  public constructor(orderId: OrderId) {
    super(
      'authorization.reversed',
      `The authorization of order ${orderId.toString()} is already reversed.`,
    );
  }
}
