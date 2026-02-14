import type { Kysely } from 'kysely';

import type { RestaurantTables } from './restaurant-tables.js';

export interface RestaurantDatabase {
  current(): Kysely<RestaurantTables>;
}
export const RestaurantDatabase = Symbol('RestaurantDatabase');
