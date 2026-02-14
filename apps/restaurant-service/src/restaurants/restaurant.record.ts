import { Address, Currency, Money } from '@ftgo/common';

import type { MenuItemsTable } from '../database/tables/menu-items.table.js';
import type { RestaurantsTable } from '../database/tables/restaurants.table.js';

import { MenuItemId } from './entities/menu-item-id.js';
import { MenuItemName } from './entities/menu-item-name.js';
import { MenuItem } from './entities/menu-item.js';
import { Menu } from './entities/menu.js';
import { RestaurantId } from './entities/restaurant-id.js';
import { RestaurantName } from './entities/restaurant-name.js';
import { Restaurant } from './entities/restaurant.entity.js';

export class RestaurantRecord {
  private constructor(
    private readonly row: RestaurantsTable,
    private readonly menuItems: ReadonlyArray<MenuItemsTable>,
  ) {}

  public static fromRows(
    row: RestaurantsTable,
    menuItems: ReadonlyArray<MenuItemsTable>,
  ): RestaurantRecord {
    return new RestaurantRecord(row, menuItems);
  }

  public static from(restaurant: Restaurant): RestaurantRecord {
    const restaurantId = restaurant.id.toString();
    return new RestaurantRecord(
      {
        id: restaurantId,
        name: restaurant.name.toString(),
        street1: restaurant.address.street1,
        street2: restaurant.address.street2 ?? null,
        city: restaurant.address.city,
        state: restaurant.address.state,
        zip: restaurant.address.zip,
        createdAt: restaurant.createdAt,
        updatedAt: restaurant.updatedAt,
        version: restaurant.version,
      },
      restaurant.menu.items.map((item, position) => ({
        restaurantId,
        id: item.id.toString(),
        position,
        name: item.name.toString(),
        priceAmount: item.price.amount,
        priceCurrency: item.price.currency.toString(),
      })),
    );
  }

  public toRestaurant(): Restaurant {
    return Restaurant.restore({
      id: RestaurantId.of(this.row.id),
      name: RestaurantName.of(this.row.name),
      address: Address.of({
        street1: this.row.street1,
        street2: this.row.street2 ?? undefined,
        city: this.row.city,
        state: this.row.state,
        zip: this.row.zip,
      }),
      menu: Menu.of(this.menuItems.map((item) => this.toMenuItem(item))),
      createdAt: this.row.createdAt,
      updatedAt: this.row.updatedAt,
      version: this.row.version,
    });
  }

  public restaurantRow(): RestaurantsTable {
    return { ...this.row };
  }

  public menuItemRows(): MenuItemsTable[] {
    return this.menuItems.map((item) => ({ ...item }));
  }

  private toMenuItem(item: MenuItemsTable): MenuItem {
    return MenuItem.of(
      MenuItemId.of(item.id),
      MenuItemName.of(item.name),
      Money.of(item.priceAmount, Currency.of(item.priceCurrency)),
    );
  }
}
