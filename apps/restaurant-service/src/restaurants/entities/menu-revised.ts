import type { Menu } from './menu.js';
import type { RestaurantEventTranslation } from './restaurant-event-translation.js';
import type { RestaurantEvent } from './restaurant-event.js';
import type { RestaurantId } from './restaurant-id.js';

export class MenuRevised implements RestaurantEvent {
  public constructor(
    public readonly restaurantId: RestaurantId,
    public readonly menu: Menu,
  ) {}

  public translate<T>(translation: RestaurantEventTranslation<T>): T {
    return translation.menuRevised(this);
  }
}
