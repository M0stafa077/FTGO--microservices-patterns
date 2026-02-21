import { Module } from '@nestjs/common';

import { PostgresRestaurants } from './postgres-restaurants.js';
import { RestaurantEventsController } from './restaurant-events.controller.js';
import { Restaurants } from './restaurants.js';
import { RestaurantsService } from './restaurants.service.js';

@Module({
  providers: [
    RestaurantsService,
    RestaurantEventsController,
    { provide: Restaurants, useClass: PostgresRestaurants },
  ],
  exports: [Restaurants],
})
export class RestaurantsModule {}
