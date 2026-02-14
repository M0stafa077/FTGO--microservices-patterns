import { ResourceNotFound } from '@ftgo/common';

import type { RestaurantId } from '../entities/restaurant-id.js';

export class RestaurantNotFound extends ResourceNotFound {
  public constructor(id: RestaurantId) {
    super('restaurant.not_found', `Restaurant ${id.toString()} does not exist.`);
  }
}
