import type { RestaurantId } from '../../restaurants/entities/restaurant-id.js';
import type { RestaurantName } from '../../restaurants/entities/restaurant-name.js';

import type { ConsumerId } from './consumer-id.js';
import type { DeliveryInformation } from './delivery-information.js';
import type { OrderId } from './order-id.js';
import type { OrderLineItems } from './order-line-items.js';
import type { OrderState } from './order-state.js';

export interface OrderSnapshot {
  readonly id: OrderId;
  readonly consumerId: ConsumerId;
  readonly restaurantId: RestaurantId;
  readonly restaurantName: RestaurantName;
  readonly lineItems: OrderLineItems;
  readonly deliveryInformation: DeliveryInformation;
  readonly state: OrderState;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}
