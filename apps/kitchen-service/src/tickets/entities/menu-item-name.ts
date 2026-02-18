import { InvalidInput } from '@ftgo/common';

import { MENU_ITEM_NAME_MAX_LENGTH } from '../tickets.constants.js';

export class MenuItemName {
  private constructor(private readonly value: string) {}

  public static of(value: string): MenuItemName {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > MENU_ITEM_NAME_MAX_LENGTH) {
      throw new InvalidInput(
        'menu_item.invalid_name',
        `A menu item name must have 1 to ${String(MENU_ITEM_NAME_MAX_LENGTH)} characters.`,
      );
    }
    return new MenuItemName(trimmed);
  }

  public equals(other: MenuItemName): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
