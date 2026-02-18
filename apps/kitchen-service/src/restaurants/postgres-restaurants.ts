import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { KitchenDatabase } from '../database/kitchen-database.js';

import type { RestaurantId } from './entities/restaurant-id.js';
import type { Restaurant } from './entities/restaurant.entity.js';
import { RestaurantNotReplicated } from './errors/restaurant-not-replicated.js';
import { RestaurantRecord } from './restaurant.record.js';
import type { Restaurants } from './restaurants.js';

@Injectable()
export class PostgresRestaurants implements Restaurants {
  public constructor(@Inject(KitchenDatabase) private readonly database: KitchenDatabase) {}

  public async findById(id: RestaurantId): Promise<Restaurant | undefined> {
    return (await this.findRecord(id))?.toRestaurant();
  }

  public async getById(id: RestaurantId): Promise<Restaurant> {
    const restaurant = await this.findById(id);
    if (restaurant === undefined) {
      throw new RestaurantNotReplicated(id);
    }
    return restaurant;
  }

  public async add(restaurant: Restaurant): Promise<void> {
    const record = RestaurantRecord.from(restaurant);
    try {
      await this.database
        .current()
        .insertInto('restaurants')
        .values(record.restaurantRow())
        .execute();
      await this.insertMenuItems(record);
    } catch (error) {
      PostgresFailure.of(error).rethrow('add restaurant');
    }
  }

  public async update(restaurant: Restaurant): Promise<void> {
    const record = RestaurantRecord.from(restaurant);
    const row = record.restaurantRow();
    try {
      const database = this.database.current();
      await database
        .updateTable('restaurants')
        .set({ updatedAt: row.updatedAt })
        .where('id', '=', row.id)
        .execute();
      await database.deleteFrom('restaurantMenuItems').where('restaurantId', '=', row.id).execute();
      await this.insertMenuItems(record);
    } catch (error) {
      PostgresFailure.of(error).rethrow('update restaurant');
    }
  }

  private async findRecord(id: RestaurantId): Promise<RestaurantRecord | undefined> {
    try {
      const database = this.database.current();
      const row = await database
        .selectFrom('restaurants')
        .selectAll()
        .where('id', '=', id.toString())
        .executeTakeFirst();
      if (row === undefined) {
        return undefined;
      }
      const menuItems = await database
        .selectFrom('restaurantMenuItems')
        .selectAll()
        .where('restaurantId', '=', row.id)
        .execute();
      return RestaurantRecord.fromRows(row, menuItems);
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find restaurant');
    }
  }

  private async insertMenuItems(record: RestaurantRecord): Promise<void> {
    await this.database
      .current()
      .insertInto('restaurantMenuItems')
      .values(record.menuItemRows())
      .execute();
  }
}
