import { EventDefinition } from '../event-definition.js';

import { RESTAURANT_AGGREGATE, RESTAURANT_EVENTS } from './restaurant.constants.js';
import { RestaurantMenuRevisedPayload } from './schemas/restaurant-menu-revised-payload.schema.js';

export const RestaurantMenuRevised = new EventDefinition(
  'RestaurantMenuRevised',
  RESTAURANT_EVENTS,
  RESTAURANT_AGGREGATE,
  RestaurantMenuRevisedPayload,
);
