import { InvalidInput } from '@ftgo/common';

import { DuplicateMenuItemId } from '../errors/duplicate-menu-item-id.js';
import { DuplicateMenuItemName } from '../errors/duplicate-menu-item-name.js';
import { MixedMenuCurrencies } from '../errors/mixed-menu-currencies.js';
import { MAX_MENU_ITEMS } from '../restaurants.constants.js';

import type { MenuItem } from './menu-item.js';

export class Menu {
  private constructor(public readonly items: ReadonlyArray<MenuItem>) {}

  public static of(items: ReadonlyArray<MenuItem>): Menu {
    if (items.length === 0 || items.length > MAX_MENU_ITEMS) {
      throw new InvalidInput(
        'menu.invalid_size',
        `A menu must have 1 to ${String(MAX_MENU_ITEMS)} items.`,
      );
    }
    const duplicateId = Menu.firstDuplicate(items.map((item) => item.id.toString()));
    if (duplicateId !== undefined) {
      throw new DuplicateMenuItemId(duplicateId);
    }
    const duplicateName = Menu.firstDuplicate(
      items.map((item) => item.name.toString().toLowerCase()),
    );
    if (duplicateName !== undefined) {
      throw new DuplicateMenuItemName(duplicateName);
    }
    if (new Set(items.map((item) => item.price.currency.toString())).size > 1) {
      throw new MixedMenuCurrencies();
    }
    return new Menu([...items]);
  }

  private static firstDuplicate(keys: ReadonlyArray<string>): string | undefined {
    return keys.find((key, index) => keys.indexOf(key) !== index);
  }

  public equals(other: Menu): boolean {
    return (
      this.items.length === other.items.length &&
      this.items.every((item, index) => other.items[index]?.equals(item) === true)
    );
  }
}
