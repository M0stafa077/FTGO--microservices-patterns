import { InvalidInput, type Quantity } from '@ftgo/common';

import type { MenuItemId } from '../../restaurants/entities/menu-item-id.js';
import { MAX_LINE_ITEM_QUANTITY } from '../tickets.constants.js';

import type { MenuItemName } from './menu-item-name.js';

export class TicketLineItem {
  private constructor(
    public readonly menuItemId: MenuItemId,
    public readonly name: MenuItemName,
    public readonly quantity: Quantity,
  ) {}

  public static of(menuItemId: MenuItemId, name: MenuItemName, quantity: Quantity): TicketLineItem {
    if (quantity.value > MAX_LINE_ITEM_QUANTITY) {
      throw new InvalidInput(
        'ticket.invalid_quantity',
        `A line item quantity must be 1 to ${String(MAX_LINE_ITEM_QUANTITY)}.`,
      );
    }
    return new TicketLineItem(menuItemId, name, quantity);
  }
}
