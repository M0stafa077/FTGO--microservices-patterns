import type { Menu } from './menu.js';
import type { RestaurantId } from './restaurant-id.js';

export interface RestaurantState {
  readonly id: RestaurantId;
  readonly menu: Menu;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
