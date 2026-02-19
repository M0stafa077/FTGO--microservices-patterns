import type { Money } from '@ftgo/common';

import type { AccountId } from './account-id.js';
import type { OrderId } from './order-id.js';

export interface AuthorizationSnapshot {
  readonly orderId: OrderId;
  readonly accountId: AccountId;
  readonly amount: Money;
  readonly authorizedAt: Date;
}
