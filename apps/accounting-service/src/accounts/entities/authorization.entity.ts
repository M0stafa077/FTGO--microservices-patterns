import type { Money } from '@ftgo/common';

import { AuthorizationMismatch } from '../errors/authorization-mismatch.js';

import type { AccountId } from './account-id.js';
import type { AuthorizationSnapshot } from './authorization-snapshot.js';
import type { OrderId } from './order-id.js';

export class Authorization {
  public readonly orderId: OrderId;
  public readonly accountId: AccountId;
  public readonly amount: Money;
  public readonly authorizedAt: Date;

  private constructor(snapshot: AuthorizationSnapshot) {
    this.orderId = snapshot.orderId;
    this.accountId = snapshot.accountId;
    this.amount = snapshot.amount;
    this.authorizedAt = snapshot.authorizedAt;
  }

  public static grant(snapshot: AuthorizationSnapshot): Authorization {
    return new Authorization(snapshot);
  }

  public static restore(snapshot: AuthorizationSnapshot): Authorization {
    return new Authorization(snapshot);
  }

  public verifyMatches(accountId: AccountId, amount: Money): void {
    if (!this.accountId.equals(accountId) || !this.amount.equals(amount)) {
      throw new AuthorizationMismatch(this.orderId);
    }
  }
}
