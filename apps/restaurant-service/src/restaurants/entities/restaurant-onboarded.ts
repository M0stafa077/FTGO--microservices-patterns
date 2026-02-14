import type { Address } from '@ftgo/common';

import type { Menu } from './menu.js';
import type { RestaurantEventTranslation } from './restaurant-event-translation.js';
import type { RestaurantEvent } from './restaurant-event.js';
import type { RestaurantId } from './restaurant-id.js';
import type { RestaurantName } from './restaurant-name.js';

export class RestaurantOnboarded implements RestaurantEvent {
  public constructor(
    public readonly restaurantId: RestaurantId,
    public readonly name: RestaurantName,
    public readonly address: Address,
    public readonly menu: Menu,
  ) {}

  public translate<T>(translation: RestaurantEventTranslation<T>): T {
    return translation.restaurantOnboarded(this);
  }
}
