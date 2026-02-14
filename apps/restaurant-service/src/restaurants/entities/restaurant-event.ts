import type { RestaurantEventTranslation } from './restaurant-event-translation.js';

export interface RestaurantEvent {
  translate<T>(translation: RestaurantEventTranslation<T>): T;
}
