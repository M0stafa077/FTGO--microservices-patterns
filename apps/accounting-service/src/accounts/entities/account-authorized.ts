import type { Money } from '@ftgo/common';

import type { AccountEventTranslation } from './account-event-translation.js';
import type { AccountEvent } from './account-event.js';
import type { OrderId } from './order-id.js';

export class AccountAuthorized implements AccountEvent {
  public constructor(
    public readonly orderId: OrderId,
    public readonly amount: Money,
    public readonly authorizedAt: Date,
  ) {}

  public translate<T>(translation: AccountEventTranslation<T>): T {
    return translation.accountAuthorized(this);
  }
}
