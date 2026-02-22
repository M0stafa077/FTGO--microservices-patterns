import type { Money } from '@ftgo/contracts';

import type { Authorization } from '../entities/authorization.js';

export class AuthorizationResponse {
  public readonly orderId: string;
  public readonly amount: Money;
  public readonly isReversed: boolean;

  public constructor(authorization: Authorization) {
    this.orderId = authorization.orderId.toString();
    this.amount = {
      amount: authorization.amount.amount,
      currency: authorization.amount.currency.toString(),
    };
    this.isReversed = authorization.isReversed;
  }
}
