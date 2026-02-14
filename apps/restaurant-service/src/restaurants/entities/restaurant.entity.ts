import type { Address } from '@ftgo/common';

import { MenuRevised } from './menu-revised.js';
import type { Menu } from './menu.js';
import type { RestaurantEvent } from './restaurant-event.js';
import { RestaurantId } from './restaurant-id.js';
import type { RestaurantName } from './restaurant-name.js';
import { RestaurantOnboarded } from './restaurant-onboarded.js';
import type { RestaurantState } from './restaurant-state.js';

export class Restaurant {
  public readonly id: RestaurantId;
  public readonly name: RestaurantName;
  public readonly address: Address;
  public readonly createdAt: Date;
  public readonly version: number;
  private currentMenu: Menu;
  private lastUpdatedAt: Date;
  private readonly pendingEvents: RestaurantEvent[] = [];

  private constructor(state: RestaurantState) {
    this.id = state.id;
    this.name = state.name;
    this.address = state.address;
    this.createdAt = state.createdAt;
    this.version = state.version;
    this.currentMenu = state.menu;
    this.lastUpdatedAt = state.updatedAt;
  }

  public get menu(): Menu {
    return this.currentMenu;
  }

  public get updatedAt(): Date {
    return this.lastUpdatedAt;
  }

  public static onboard(name: RestaurantName, address: Address, menu: Menu, now: Date): Restaurant {
    const restaurant = new Restaurant({
      id: RestaurantId.generate(),
      name,
      address,
      menu,
      createdAt: now,
      updatedAt: now,
      version: 0,
    });
    restaurant.pendingEvents.push(new RestaurantOnboarded(restaurant.id, name, address, menu));
    return restaurant;
  }

  public static restore(state: RestaurantState): Restaurant {
    return new Restaurant(state);
  }

  public releaseEvents(): ReadonlyArray<RestaurantEvent> {
    return this.pendingEvents.splice(0);
  }

  public reviseMenu(menu: Menu, now: Date): void {
    if (menu.equals(this.currentMenu)) {
      return;
    }
    this.currentMenu = menu;
    this.lastUpdatedAt = now;
    this.pendingEvents.push(new MenuRevised(this.id, menu));
  }
}
