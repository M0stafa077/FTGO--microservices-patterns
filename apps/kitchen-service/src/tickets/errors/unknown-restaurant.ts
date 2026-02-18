import { RuleViolation } from '@ftgo/common';

import type { RestaurantId } from '../../restaurants/entities/restaurant-id.js';

export class UnknownRestaurant extends RuleViolation {
  public constructor(id: RestaurantId) {
    super('ticket.unknown_restaurant', `Restaurant ${id.toString()} is not known to the kitchen.`);
  }
}
