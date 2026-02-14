import { ConcurrentModification } from '@ftgo/common';
import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { RestaurantDatabase } from '../database/restaurant-database.js';
import type { RestaurantsTable } from '../database/tables/restaurants.table.js';

import type { RestaurantId } from './entities/restaurant-id.js';
import type { Restaurant } from './entities/restaurant.entity.js';
import { RestaurantNotFound } from './errors/restaurant-not-found.js';
import { RestaurantRecord } from './restaurant.record.js';
import type { Restaurants } from './restaurants.js';

@Injectable()
export class PostgresRestaurants implements Restaurants {
  public constructor(@Inject(RestaurantDatabase) private readonly database: RestaurantDatabase) {}

  public async getById(id: RestaurantId): Promise<Restaurant> {
    const record = await this.findRecord(id);
    if (record === undefined) {
      throw new RestaurantNotFound(id);
    }
    return record.toRestaurant();
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
    if ((await this.updateRow(row)) === 0n) {
      throw new ConcurrentModification('Restaurant', row.id);
    }
    try {
      await this.database
        .current()
        .deleteFrom('menuItems')
        .where('restaurantId', '=', row.id)
        .execute();
      await this.insertMenuItems(record);
    } catch (error) {
      PostgresFailure.of(error).rethrow('replace menu items');
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
        .selectFrom('menuItems')
        .selectAll()
        .where('restaurantId', '=', row.id)
        .orderBy('position')
        .execute();
      return RestaurantRecord.fromRows(row, menuItems);
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find restaurant');
    }
  }

  private async updateRow(row: RestaurantsTable): Promise<bigint> {
    try {
      const result = await this.database
        .current()
        .updateTable('restaurants')
        .set({ updatedAt: row.updatedAt, version: row.version + 1 })
        .where('id', '=', row.id)
        .where('version', '=', row.version)
        .executeTakeFirst();
      return result.numUpdatedRows;
    } catch (error) {
      return PostgresFailure.of(error).rethrow('update restaurant');
    }
  }

  private async insertMenuItems(record: RestaurantRecord): Promise<void> {
    await this.database.current().insertInto('menuItems').values(record.menuItemRows()).execute();
  }
}
