import type { AccountEventTranslation } from './account-event-translation.js';
import type { AccountEvent } from './account-event.js';
import type { OrderId } from './order-id.js';

export class AuthorizationReversed implements AccountEvent {
  public constructor(
    public readonly orderId: OrderId,
    public readonly reversedAt: Date,
  ) {}

  public translate<T>(translation: AccountEventTranslation<T>): T {
    return translation.authorizationReversed(this);
  }
}
