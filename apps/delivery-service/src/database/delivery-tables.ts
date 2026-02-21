import type { MessagingTables } from '@ftgo/messaging/infrastructure';

import type { CouriersTable } from './tables/couriers.table.js';
import type { DeliveriesTable } from './tables/deliveries.table.js';
import type { RestaurantsTable } from './tables/restaurants.table.js';

export interface DeliveryTables extends MessagingTables {
  restaurants: RestaurantsTable;
  couriers: CouriersTable;
  deliveries: DeliveriesTable;
}
