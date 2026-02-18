import type { RestaurantMenuItemsTable } from '../database/tables/restaurant-menu-items.table.js';
import type { RestaurantsTable } from '../database/tables/restaurants.table.js';

import { MenuItemId } from './entities/menu-item-id.js';
import { Menu } from './entities/menu.js';
import { RestaurantId } from './entities/restaurant-id.js';
import { Restaurant } from './entities/restaurant.entity.js';

export class RestaurantRecord {
  private constructor(
    private readonly row: RestaurantsTable,
    private readonly menuItems: ReadonlyArray<RestaurantMenuItemsTable>,
  ) {}

  public static fromRows(
    row: RestaurantsTable,
    menuItems: ReadonlyArray<RestaurantMenuItemsTable>,
  ): RestaurantRecord {
    return new RestaurantRecord(row, menuItems);
  }

  public static from(restaurant: Restaurant): RestaurantRecord {
    const restaurantId = restaurant.id.toString();
    return new RestaurantRecord(
      {
        id: restaurantId,
        createdAt: restaurant.createdAt,
        updatedAt: restaurant.updatedAt,
      },
      restaurant.menu.itemIds.map((id) => ({ restaurantId, id: id.toString() })),
    );
  }

  public toRestaurant(): Restaurant {
    return Restaurant.restore({
      id: RestaurantId.of(this.row.id),
      menu: Menu.of(this.menuItems.map((item) => MenuItemId.of(item.id))),
      createdAt: this.row.createdAt,
      updatedAt: this.row.updatedAt,
    });
  }

  public restaurantRow(): RestaurantsTable {
    return { ...this.row };
  }

  public menuItemRows(): RestaurantMenuItemsTable[] {
    return this.menuItems.map((item) => ({ ...item }));
  }
}
