import type { RestaurantMenu } from '@ftgo/contracts';

import type { Menu } from './entities/menu.js';

export class PublishedMenu {
  public constructor(private readonly menu: Menu) {}

  public toPayload(): RestaurantMenu {
    return {
      items: this.menu.items.map((item) => ({
        id: item.id.toString(),
        name: item.name.toString(),
        price: { amount: item.price.amount, currency: item.price.currency.toString() },
      })),
    };
  }
}
