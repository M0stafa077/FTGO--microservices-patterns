import { Clock, Transactions, type Address } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import type { RestaurantId } from './entities/restaurant-id.js';
import { Restaurant } from './entities/restaurant.entity.js';
import { Restaurants } from './restaurants.js';

@Injectable()
export class RestaurantsService {
  public constructor(
    @Inject(Restaurants) private readonly restaurants: Restaurants,
    @Inject(Transactions) private readonly transactions: Transactions,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async addRestaurant(id: RestaurantId, address: Address): Promise<void> {
    await this.transactions.run(async () => {
      if ((await this.restaurants.findById(id)) !== undefined) {
        return;
      }
      await this.restaurants.add(Restaurant.replicate(id, address, this.clock.now()));
    });
  }
}
