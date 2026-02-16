import { Currency, Money } from '@ftgo/common';
import {
  RestaurantCreated,
  RestaurantMenuRevised,
  type RestaurantCreatedPayload,
  type RestaurantMenu,
  type RestaurantMenuRevisedPayload,
} from '@ftgo/contracts';
import type { IncomingMessage } from '@ftgo/messaging';
import { MessageController, OnEvent } from '@ftgo/messaging/infrastructure';
import { Injectable } from '@nestjs/common';

import { MenuItemId } from './entities/menu-item-id.js';
import { MenuItemName } from './entities/menu-item-name.js';
import { MenuItem } from './entities/menu-item.js';
import { Menu } from './entities/menu.js';
import { RestaurantId } from './entities/restaurant-id.js';
import { RestaurantName } from './entities/restaurant-name.js';
import { RestaurantsService } from './restaurants.service.js';

@MessageController()
@Injectable()
export class RestaurantEventsController {
  public constructor(private readonly restaurantsService: RestaurantsService) {}

  @OnEvent(RestaurantCreated)
  public async restaurantCreated(event: IncomingMessage<RestaurantCreatedPayload>): Promise<void> {
    const { restaurantId, name, menu } = event.payload;
    await this.restaurantsService.addRestaurant(
      RestaurantId.of(restaurantId),
      RestaurantName.of(name),
      this.menuOf(menu),
    );
  }

  @OnEvent(RestaurantMenuRevised)
  public async restaurantMenuRevised(
    event: IncomingMessage<RestaurantMenuRevisedPayload>,
  ): Promise<void> {
    const { restaurantId, menu } = event.payload;
    await this.restaurantsService.reviseMenu(RestaurantId.of(restaurantId), this.menuOf(menu));
  }

  private menuOf(menu: RestaurantMenu): Menu {
    return Menu.of(
      menu.items.map((item) =>
        MenuItem.of(
          MenuItemId.of(item.id),
          MenuItemName.of(item.name),
          Money.of(item.price.amount, Currency.of(item.price.currency)),
        ),
      ),
    );
  }
}
