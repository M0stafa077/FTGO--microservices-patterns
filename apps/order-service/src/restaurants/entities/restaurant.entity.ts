import type { MenuItemId } from './menu-item-id.js';
import type { MenuItem } from './menu-item.js';
import type { Menu } from './menu.js';
import type { RestaurantId } from './restaurant-id.js';
import type { RestaurantName } from './restaurant-name.js';
import type { RestaurantState } from './restaurant-state.js';

export class Restaurant {
  public readonly id: RestaurantId;
  public readonly name: RestaurantName;
  public readonly createdAt: Date;
  private currentMenu: Menu;
  private lastUpdatedAt: Date;

  private constructor(state: RestaurantState) {
    this.id = state.id;
    this.name = state.name;
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

  public static replicate(
    id: RestaurantId,
    name: RestaurantName,
    menu: Menu,
    now: Date,
  ): Restaurant {
    return new Restaurant({ id, name, menu, createdAt: now, updatedAt: now });
  }

  public static restore(state: RestaurantState): Restaurant {
    return new Restaurant(state);
  }

  public findMenuItem(id: MenuItemId): MenuItem | undefined {
    return this.currentMenu.findItem(id);
  }

  public reviseMenu(menu: Menu, now: Date): void {
    this.currentMenu = menu;
    this.lastUpdatedAt = now;
  }
}
