import type { MessagingTables } from '@ftgo/messaging/infrastructure';
import type { SagaTables } from '@ftgo/saga/infrastructure';

import type { OrderLineItemsTable } from './tables/order-line-items.table.js';
import type { OrdersTable } from './tables/orders.table.js';
import type { RestaurantMenuItemsTable } from './tables/restaurant-menu-items.table.js';
import type { RestaurantsTable } from './tables/restaurants.table.js';

export interface OrderTables extends MessagingTables, SagaTables {
  restaurants: RestaurantsTable;
  restaurantMenuItems: RestaurantMenuItemsTable;
  orders: OrdersTable;
  orderLineItems: OrderLineItemsTable;
}
