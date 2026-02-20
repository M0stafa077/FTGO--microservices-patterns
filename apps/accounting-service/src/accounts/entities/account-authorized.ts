import type { Money } from '@ftgo/common';

import type { OrderId } from './order-id.js';

export class AccountAuthorized {
  public constructor(
    public readonly orderId: OrderId,
    public readonly amount: Money,
    public readonly authorizedAt: Date,
  ) {}
}
