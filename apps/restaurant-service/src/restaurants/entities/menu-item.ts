import { InvalidInput, type Money } from '@ftgo/common';

import { MAX_MENU_ITEM_PRICE } from '../restaurants.constants.js';

import type { MenuItemId } from './menu-item-id.js';
import type { MenuItemName } from './menu-item-name.js';

export class MenuItem {
  private constructor(
    public readonly id: MenuItemId,
    public readonly name: MenuItemName,
    public readonly price: Money,
  ) {}

  public static of(id: MenuItemId, name: MenuItemName, price: Money): MenuItem {
    if (price.amount < 1 || price.amount > MAX_MENU_ITEM_PRICE) {
      throw new InvalidInput(
        'menu_item.invalid_price',
        `A menu item price must be 1 to ${String(MAX_MENU_ITEM_PRICE)} minor units.`,
      );
    }
    return new MenuItem(id, name, price);
  }

  public equals(other: MenuItem): boolean {
    return (
      this.id.equals(other.id) && this.name.equals(other.name) && this.price.equals(other.price)
    );
  }
}
