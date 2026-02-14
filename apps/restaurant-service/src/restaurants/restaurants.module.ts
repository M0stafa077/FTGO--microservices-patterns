import { Module } from '@nestjs/common';

import { PostgresRestaurants } from './postgres-restaurants.js';
import { RestaurantEventMessages } from './restaurant-event-messages.js';
import { RestaurantsController } from './restaurants.controller.js';
import { Restaurants } from './restaurants.js';
import { RestaurantsService } from './restaurants.service.js';

@Module({
  controllers: [RestaurantsController],
  providers: [
    RestaurantsService,
    RestaurantEventMessages,
    { provide: Restaurants, useClass: PostgresRestaurants },
  ],
})
export class RestaurantsModule {}
