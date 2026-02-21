import { Address } from '@ftgo/common';
import { RestaurantCreated, type RestaurantCreatedPayload } from '@ftgo/contracts';
import type { IncomingMessage } from '@ftgo/messaging';
import { MessageController, OnEvent } from '@ftgo/messaging/infrastructure';
import { Injectable } from '@nestjs/common';

import { RestaurantId } from './entities/restaurant-id.js';
import { RestaurantsService } from './restaurants.service.js';

@MessageController()
@Injectable()
export class RestaurantEventsController {
  public constructor(private readonly restaurantsService: RestaurantsService) {}

  @OnEvent(RestaurantCreated)
  public async restaurantCreated(event: IncomingMessage<RestaurantCreatedPayload>): Promise<void> {
    const { restaurantId, address } = event.payload;
    await this.restaurantsService.addRestaurant(RestaurantId.of(restaurantId), Address.of(address));
  }
}
