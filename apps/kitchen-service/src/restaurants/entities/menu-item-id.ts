import { InvalidInput } from '@ftgo/common';

import { MENU_ITEM_ID_FORMAT } from '../restaurants.constants.js';

export class MenuItemId {
  private constructor(private readonly value: string) {}

  public static of(value: string): MenuItemId {
    if (!MENU_ITEM_ID_FORMAT.test(value)) {
      throw new InvalidInput(
        'menu_item.invalid_id',
        'A menu item id must have 1 to 64 lowercase letters, digits, or hyphens.',
      );
    }
    return new MenuItemId(value);
  }

  public equals(other: MenuItemId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
