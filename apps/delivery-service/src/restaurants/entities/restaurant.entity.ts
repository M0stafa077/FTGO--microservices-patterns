import type { Address } from '@ftgo/common';

import type { RestaurantId } from './restaurant-id.js';

export class Restaurant {
  private constructor(
    public readonly id: RestaurantId,
    public readonly address: Address,
    public readonly createdAt: Date,
  ) {}

  public static replicate(id: RestaurantId, address: Address, now: Date): Restaurant {
    return new Restaurant(id, address, now);
  }

  public static restore(id: RestaurantId, address: Address, createdAt: Date): Restaurant {
    return new Restaurant(id, address, createdAt);
  }
}
