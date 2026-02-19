import type { Money } from '@ftgo/common';

import type { AccountId } from './account-id.js';
import { Authorization } from './authorization.entity.js';
import type { OrderId } from './order-id.js';

export class Account {
  private constructor(
    public readonly id: AccountId,
    public readonly openedAt: Date,
  ) {}

  public static open(id: AccountId, now: Date): Account {
    return new Account(id, now);
  }

  public static restore(id: AccountId, openedAt: Date): Account {
    return new Account(id, openedAt);
  }

  public authorize(orderId: OrderId, amount: Money, now: Date): Authorization {
    return Authorization.grant({ orderId, accountId: this.id, amount, authorizedAt: now });
  }
}
