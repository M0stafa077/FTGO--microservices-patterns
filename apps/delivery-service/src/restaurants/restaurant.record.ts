import { Address } from '@ftgo/common';

import type { RestaurantsTable } from '../database/tables/restaurants.table.js';

import { RestaurantId } from './entities/restaurant-id.js';
import { Restaurant } from './entities/restaurant.entity.js';

export class RestaurantRecord {
  private constructor(private readonly row: RestaurantsTable) {}

  public static fromRow(row: RestaurantsTable): RestaurantRecord {
    return new RestaurantRecord(row);
  }

  public static from(restaurant: Restaurant): RestaurantRecord {
    const { address } = restaurant;
    return new RestaurantRecord({
      id: restaurant.id.toString(),
      street1: address.street1,
      street2: address.street2 ?? null,
      city: address.city,
      state: address.state,
      zip: address.zip,
      createdAt: restaurant.createdAt,
    });
  }

  public toRestaurant(): Restaurant {
    return Restaurant.restore(
      RestaurantId.of(this.row.id),
      Address.of({
        street1: this.row.street1,
        street2: this.row.street2 ?? undefined,
        city: this.row.city,
        state: this.row.state,
        zip: this.row.zip,
      }),
      this.row.createdAt,
    );
  }

  public restaurantRow(): RestaurantsTable {
    return { ...this.row };
  }
}
