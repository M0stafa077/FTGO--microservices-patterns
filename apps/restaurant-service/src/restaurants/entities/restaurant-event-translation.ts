import type { MenuRevised } from './menu-revised.js';
import type { RestaurantOnboarded } from './restaurant-onboarded.js';

export interface RestaurantEventTranslation<T> {
  restaurantOnboarded(event: RestaurantOnboarded): T;

  menuRevised(event: MenuRevised): T;
}
