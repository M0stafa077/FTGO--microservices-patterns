import { EventDefinition } from '../event-definition.js';

import { RESTAURANT_AGGREGATE, RESTAURANT_EVENTS } from './restaurant.constants.js';
import { RestaurantCreatedPayload } from './schemas/restaurant-created-payload.schema.js';

export const RestaurantCreated = new EventDefinition(
  'RestaurantCreated',
  RESTAURANT_EVENTS,
  RESTAURANT_AGGREGATE,
  RestaurantCreatedPayload,
);
