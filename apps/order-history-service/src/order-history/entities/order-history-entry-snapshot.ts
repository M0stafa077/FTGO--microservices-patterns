import type { Money } from '@ftgo/common';

import type { ConsumerId } from './consumer-id.js';
import type { HistoryLineItem } from './history-line-item.js';
import type { OrderId } from './order-id.js';
import type { OrderState } from './order-state.js';
import type { RestaurantId } from './restaurant-id.js';

export interface OrderHistoryEntrySnapshot {
  readonly id: OrderId;
  readonly consumerId: ConsumerId;
  readonly restaurantId: RestaurantId;
  readonly restaurantName: string;
  readonly lineItems: ReadonlyArray<HistoryLineItem>;
  readonly orderTotal: Money;
  readonly state: OrderState;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}
