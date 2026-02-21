import { Duration } from '@ftgo/common';

import { DeliveryState } from './entities/delivery-state.js';

export const DROPOFF_DELAY: Duration = Duration.ofMinutes(30);
export const DELIVERY_STATES: ReadonlyMap<string, DeliveryState> = new Map(
  Object.values(DeliveryState).map((state) => [state, state]),
);
