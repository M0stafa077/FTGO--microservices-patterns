import type { Menu } from './menu.js';
import type { RestaurantId } from './restaurant-id.js';
import type { RestaurantName } from './restaurant-name.js';

export interface RestaurantState {
  readonly id: RestaurantId;
  readonly name: RestaurantName;
  readonly menu: Menu;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
