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
import { Menu } from './entities/menu.js';
import { RestaurantId } from './entities/restaurant-id.js';
import { RestaurantsService } from './restaurants.service.js';

@MessageController()
@Injectable()
export class RestaurantEventsController {
  public constructor(private readonly restaurantsService: RestaurantsService) {}

  @OnEvent(RestaurantCreated)
  public async restaurantCreated(event: IncomingMessage<RestaurantCreatedPayload>): Promise<void> {
    const { restaurantId, menu } = event.payload;
    await this.restaurantsService.addRestaurant(RestaurantId.of(restaurantId), this.menuOf(menu));
  }

  @OnEvent(RestaurantMenuRevised)
  public async restaurantMenuRevised(
    event: IncomingMessage<RestaurantMenuRevisedPayload>,
  ): Promise<void> {
    const { restaurantId, menu } = event.payload;
    await this.restaurantsService.reviseMenu(RestaurantId.of(restaurantId), this.menuOf(menu));
  }

  private menuOf(menu: RestaurantMenu): Menu {
    return Menu.of(menu.items.map((item) => MenuItemId.of(item.id)));
  }
}
