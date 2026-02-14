import { Clock, Transactions, type Address } from '@ftgo/common';
import { Outbox } from '@ftgo/messaging';
import { Inject, Injectable } from '@nestjs/common';

import type { Menu } from './entities/menu.js';
import type { RestaurantId } from './entities/restaurant-id.js';
import type { RestaurantName } from './entities/restaurant-name.js';
import { Restaurant } from './entities/restaurant.entity.js';
import { RestaurantEventMessages } from './restaurant-event-messages.js';
import { Restaurants } from './restaurants.js';

@Injectable()
export class RestaurantsService {
  public constructor(
    @Inject(Restaurants) private readonly restaurants: Restaurants,
    @Inject(Transactions) private readonly transactions: Transactions,
    @Inject(Outbox) private readonly outbox: Outbox,
    private readonly eventMessages: RestaurantEventMessages,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async onboard(name: RestaurantName, address: Address, menu: Menu): Promise<Restaurant> {
    return this.transactions.run(async () => {
      const restaurant = Restaurant.onboard(name, address, menu, this.clock.now());
      await this.restaurants.add(restaurant);
      await this.publishEventsOf(restaurant);
      return restaurant;
    });
  }

  public async getById(id: RestaurantId): Promise<Restaurant> {
    return this.restaurants.getById(id);
  }

  public async reviseMenu(id: RestaurantId, menu: Menu): Promise<void> {
    await this.transactions.run(async () => {
      const restaurant = await this.restaurants.getById(id);
      restaurant.reviseMenu(menu, this.clock.now());
      await this.restaurants.update(restaurant);
      await this.publishEventsOf(restaurant);
    });
  }

  private async publishEventsOf(restaurant: Restaurant): Promise<void> {
    for (const event of restaurant.releaseEvents()) {
      await this.outbox.append(this.eventMessages.of(event));
    }
  }
}
