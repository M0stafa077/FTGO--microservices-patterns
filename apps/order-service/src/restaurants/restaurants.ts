import type { RestaurantId } from './entities/restaurant-id.js';
import type { Restaurant } from './entities/restaurant.entity.js';

export interface Restaurants {
  findById(id: RestaurantId): Promise<Restaurant | undefined>;

  getById(id: RestaurantId): Promise<Restaurant>;

  add(restaurant: Restaurant): Promise<void>;

  update(restaurant: Restaurant): Promise<void>;
}
export const Restaurants = Symbol('Restaurants');
