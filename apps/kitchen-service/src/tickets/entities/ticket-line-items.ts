import { InvalidInput } from '@ftgo/common';

import type { Restaurant } from '../../restaurants/entities/restaurant.entity.js';
import { DuplicateLineItem } from '../errors/duplicate-line-item.js';
import { UnknownLineItem } from '../errors/unknown-line-item.js';
import { UnknownMenuItem } from '../errors/unknown-menu-item.js';
import { MAX_LINE_ITEMS } from '../tickets.constants.js';

import type { RevisedLineItem } from './revised-line-item.js';
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
    TicketLineItems.verifyUnique(items.map((item) => item.menuItemId.toString()));
    return new TicketLineItems([...items]);
  }

  private static verifyUnique(menuItemIds: ReadonlyArray<string>): void {
    const duplicate = menuItemIds.find((id, index) => menuItemIds.indexOf(id) !== index);
    if (duplicate !== undefined) {
      throw new DuplicateLineItem(duplicate);
    }
  }

  public revisedWith(revisions: ReadonlyArray<RevisedLineItem>): TicketLineItems {
    TicketLineItems.verifyUnique(revisions.map((revision) => revision.menuItemId.toString()));
    const unknown = revisions.find(
      (revision) => !this.items.some((item) => item.menuItemId.equals(revision.menuItemId)),
    );
    if (unknown !== undefined) {
      throw new UnknownLineItem(unknown.menuItemId);
    }
    return TicketLineItems.of(
      this.items.map((item) => {
        const revision = revisions.find((candidate) =>
          candidate.menuItemId.equals(item.menuItemId),
        );
        return revision === undefined ? item : item.withQuantity(revision.quantity);
      }),
    );
  }

  public verifyOfferedBy(restaurant: Restaurant): void {
    const unknown = this.items.find((item) => !restaurant.offers(item.menuItemId));
    if (unknown !== undefined) {
      throw new UnknownMenuItem(unknown.menuItemId);
    }
  }
}
