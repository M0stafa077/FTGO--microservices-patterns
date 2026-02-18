import { ResourceNotFound } from '@ftgo/common';

import type { RestaurantId } from '../entities/restaurant-id.js';

export class RestaurantNotReplicated extends ResourceNotFound {
  public constructor(id: RestaurantId) {
    super(
      'restaurant.not_replicated',
      `Restaurant ${id.toString()} is not in the replica. Its RestaurantCreated event is missing.`,
    );
  }
}
