import type { Money } from '@ftgo/common';

import type { MenuItemId } from './menu-item-id.js';
import type { MenuItemName } from './menu-item-name.js';

export class MenuItem {
  private constructor(
    public readonly id: MenuItemId,
    public readonly name: MenuItemName,
    public readonly price: Money,
  ) {}

  public static of(id: MenuItemId, name: MenuItemName, price: Money): MenuItem {
    return new MenuItem(id, name, price);
  }
}
