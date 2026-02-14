import { RestaurantCreated, RestaurantMenuRevised } from '@ftgo/contracts';
import { OutgoingMessage } from '@ftgo/messaging';
import { Injectable } from '@nestjs/common';

import type { MenuRevised } from './entities/menu-revised.js';
import type { RestaurantEventTranslation } from './entities/restaurant-event-translation.js';
import type { RestaurantEvent } from './entities/restaurant-event.js';
import type { RestaurantOnboarded } from './entities/restaurant-onboarded.js';
import { PublishedAddress } from './published-address.js';
import { PublishedMenu } from './published-menu.js';

@Injectable()
export class RestaurantEventMessages implements RestaurantEventTranslation<OutgoingMessage> {
  public of(event: RestaurantEvent): OutgoingMessage {
    return event.translate(this);
  }

  public restaurantOnboarded(event: RestaurantOnboarded): OutgoingMessage {
    const restaurantId = event.restaurantId.toString();
    return OutgoingMessage.event(RestaurantCreated, restaurantId, {
      restaurantId,
      name: event.name.toString(),
      address: new PublishedAddress(event.address).toPayload(),
      menu: new PublishedMenu(event.menu).toPayload(),
    });
  }

  public menuRevised(event: MenuRevised): OutgoingMessage {
    const restaurantId = event.restaurantId.toString();
    return OutgoingMessage.event(RestaurantMenuRevised, restaurantId, {
      restaurantId,
      menu: new PublishedMenu(event.menu).toPayload(),
    });
  }
}
