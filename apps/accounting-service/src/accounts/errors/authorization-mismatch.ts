import { RuleViolation } from '@ftgo/common';

import type { OrderId } from '../entities/order-id.js';

export class AuthorizationMismatch extends RuleViolation {
  public constructor(orderId: OrderId) {
    super(
      'authorization.mismatch',
      `Order ${orderId.toString()} is already authorized for another amount.`,
    );
  }
}
