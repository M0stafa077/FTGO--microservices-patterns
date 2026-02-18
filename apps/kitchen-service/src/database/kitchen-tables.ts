import type { MessagingTables } from '@ftgo/messaging/infrastructure';

import type { RestaurantMenuItemsTable } from './tables/restaurant-menu-items.table.js';
import type { RestaurantsTable } from './tables/restaurants.table.js';
import type { TicketLineItemsTable } from './tables/ticket-line-items.table.js';
import type { TicketsTable } from './tables/tickets.table.js';

export interface KitchenTables extends MessagingTables {
  restaurants: RestaurantsTable;
  restaurantMenuItems: RestaurantMenuItemsTable;
  tickets: TicketsTable;
  ticketLineItems: TicketLineItemsTable;
}
