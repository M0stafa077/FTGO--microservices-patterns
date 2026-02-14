import type { Address, RestaurantMenu } from '@ftgo/contracts';

import type { Restaurant } from '../entities/restaurant.entity.js';
import { PublishedAddress } from '../published-address.js';
import { PublishedMenu } from '../published-menu.js';

export class RestaurantResponse {
  public readonly id: string;
  public readonly name: string;
  public readonly address: Address;
  public readonly menu: RestaurantMenu;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  public constructor(restaurant: Restaurant) {
    this.id = restaurant.id.toString();
    this.name = restaurant.name.toString();
    this.address = new PublishedAddress(restaurant.address).toPayload();
    this.menu = new PublishedMenu(restaurant.menu).toPayload();
    this.createdAt = restaurant.createdAt.toISOString();
    this.updatedAt = restaurant.updatedAt.toISOString();
  }
}
