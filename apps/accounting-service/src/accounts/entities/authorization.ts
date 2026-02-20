import type { Money } from '@ftgo/common';

import { AuthorizationAlreadyReversed } from '../errors/authorization-already-reversed.js';
import { AuthorizationMismatch } from '../errors/authorization-mismatch.js';

import type { OrderId } from './order-id.js';

export class Authorization {
  private constructor(
    public readonly orderId: OrderId,
    public readonly amount: Money,
    public readonly isReversed: boolean,
  ) {}

  public static granted(orderId: OrderId, amount: Money): Authorization {
    return new Authorization(orderId, amount, false);
  }

  public reversed(): Authorization {
    return new Authorization(this.orderId, this.amount, true);
  }

  public revisedTo(amount: Money): Authorization {
    return new Authorization(this.orderId, amount, this.isReversed);
  }

  public verifyActive(): void {
    if (this.isReversed) {
      throw new AuthorizationAlreadyReversed(this.orderId);
    }
  }

  public verifyAmount(amount: Money): void {
    if (!this.amount.equals(amount)) {
      throw new AuthorizationMismatch(this.orderId);
    }
  }
}
