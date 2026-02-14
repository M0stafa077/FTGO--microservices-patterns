import type { MessagingTables } from '@ftgo/messaging/infrastructure';

import type { MenuItemsTable } from './tables/menu-items.table.js';
import type { RestaurantsTable } from './tables/restaurants.table.js';

export interface RestaurantTables extends MessagingTables {
  restaurants: RestaurantsTable;
  menuItems: MenuItemsTable;
}
