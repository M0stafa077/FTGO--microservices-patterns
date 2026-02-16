import type { MenuItemId } from './menu-item-id.js';
import type { MenuItem } from './menu-item.js';

export class Menu {
  private constructor(public readonly items: ReadonlyArray<MenuItem>) {}

  public static of(items: ReadonlyArray<MenuItem>): Menu {
    return new Menu([...items]);
  }

  public findItem(id: MenuItemId): MenuItem | undefined {
    return this.items.find((item) => item.id.equals(id));
  }
}
