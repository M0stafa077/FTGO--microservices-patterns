import { InvalidInput } from '@ftgo/common';

import type { Restaurant } from '../../restaurants/entities/restaurant.entity.js';
import { DuplicateLineItem } from '../errors/duplicate-line-item.js';
import { UnknownMenuItem } from '../errors/unknown-menu-item.js';
import { MAX_LINE_ITEMS } from '../tickets.constants.js';

import type { TicketLineItem } from './ticket-line-item.js';

export class TicketLineItems {
  private constructor(public readonly items: ReadonlyArray<TicketLineItem>) {}

  public static of(items: ReadonlyArray<TicketLineItem>): TicketLineItems {
    if (items.length === 0 || items.length > MAX_LINE_ITEMS) {
      throw new InvalidInput(
        'ticket.invalid_line_item_count',
        `A ticket must have 1 to ${String(MAX_LINE_ITEMS)} line items.`,
      );
    }
    const menuItemIds = items.map((item) => item.menuItemId.toString());
    const duplicate = menuItemIds.find((id, index) => menuItemIds.indexOf(id) !== index);
    if (duplicate !== undefined) {
      throw new DuplicateLineItem(duplicate);
    }
    return new TicketLineItems([...items]);
  }

  public verifyOfferedBy(restaurant: Restaurant): void {
    const unknown = this.items.find((item) => !restaurant.offers(item.menuItemId));
    if (unknown !== undefined) {
      throw new UnknownMenuItem(unknown.menuItemId);
    }
  }
}
