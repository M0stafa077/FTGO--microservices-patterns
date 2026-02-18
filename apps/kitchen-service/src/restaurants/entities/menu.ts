import type { MenuItemId } from './menu-item-id.js';

export class Menu {
  private constructor(public readonly itemIds: ReadonlyArray<MenuItemId>) {}

  public static of(itemIds: ReadonlyArray<MenuItemId>): Menu {
    return new Menu([...itemIds]);
  }

  public offers(itemId: MenuItemId): boolean {
    return this.itemIds.some((id) => id.equals(itemId));
  }
}
