import type { MenuItemId } from './menu-item-id.js';
import type { Menu } from './menu.js';
import type { RestaurantId } from './restaurant-id.js';
import type { RestaurantState } from './restaurant-state.js';

export class Restaurant {
  public readonly id: RestaurantId;
  public readonly createdAt: Date;
  private currentMenu: Menu;
  private lastUpdatedAt: Date;

  private constructor(state: RestaurantState) {
    this.id = state.id;
    this.createdAt = state.createdAt;
    this.currentMenu = state.menu;
    this.lastUpdatedAt = state.updatedAt;
  }

  public get menu(): Menu {
    return this.currentMenu;
  }

  public get updatedAt(): Date {
    return this.lastUpdatedAt;
  }

  public static replicate(id: RestaurantId, menu: Menu, now: Date): Restaurant {
    return new Restaurant({ id, menu, createdAt: now, updatedAt: now });
  }

  public static restore(state: RestaurantState): Restaurant {
    return new Restaurant(state);
  }

  public offers(menuItemId: MenuItemId): boolean {
    return this.currentMenu.offers(menuItemId);
  }

  public reviseMenu(menu: Menu, now: Date): void {
    this.currentMenu = menu;
    this.lastUpdatedAt = now;
  }
}
