import type { Address } from '@ftgo/common';

import type { RestaurantId } from '../../restaurants/entities/restaurant-id.js';

import type { ConsumerId } from './consumer-id.js';
import type { DeliveryId } from './delivery-id.js';
import type { DeliveryPlan } from './delivery-plan.js';
import type { DeliveryState } from './delivery-state.js';

export interface DeliverySnapshot {
  readonly id: DeliveryId;
  readonly consumerId: ConsumerId;
  readonly restaurantId: RestaurantId;
  readonly pickupAddress: Address;
  readonly deliveryAddress: Address;
  readonly state: DeliveryState;
  readonly plan: DeliveryPlan | undefined;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}
