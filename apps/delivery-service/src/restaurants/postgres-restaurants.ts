import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { DeliveryDatabase } from '../database/delivery-database.js';

import type { RestaurantId } from './entities/restaurant-id.js';
import type { Restaurant } from './entities/restaurant.entity.js';
import { RestaurantNotReplicated } from './errors/restaurant-not-replicated.js';
import { RestaurantRecord } from './restaurant.record.js';
import type { Restaurants } from './restaurants.js';

@Injectable()
export class PostgresRestaurants implements Restaurants {
  public constructor(@Inject(DeliveryDatabase) private readonly database: DeliveryDatabase) {}

  public async findById(id: RestaurantId): Promise<Restaurant | undefined> {
    try {
      const row = await this.database
        .current()
        .selectFrom('restaurants')
        .selectAll()
        .where('id', '=', id.toString())
        .executeTakeFirst();
      return row === undefined ? undefined : RestaurantRecord.fromRow(row).toRestaurant();
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find restaurant');
    }
  }

  public async getById(id: RestaurantId): Promise<Restaurant> {
    const restaurant = await this.findById(id);
    if (restaurant === undefined) {
      throw new RestaurantNotReplicated(id);
    }
    return restaurant;
  }

  public async add(restaurant: Restaurant): Promise<void> {
    try {
      await this.database
        .current()
        .insertInto('restaurants')
        .values(RestaurantRecord.from(restaurant).restaurantRow())
        .execute();
    } catch (error) {
      PostgresFailure.of(error).rethrow('add restaurant');
    }
  }
}
