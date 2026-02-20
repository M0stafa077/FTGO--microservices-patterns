import { InvalidInput, type Money } from '@ftgo/common';

import { DuplicateLineItem } from '../errors/duplicate-line-item.js';
import { UnknownLineItem } from '../errors/unknown-line-item.js';
import { MAX_LINE_ITEMS } from '../orders.constants.js';

import type { OrderLineItem } from './order-line-item.js';
import type { RequestedLineItem } from './requested-line-item.js';

export class OrderLineItems {
  private constructor(
    private readonly first: OrderLineItem,
    public readonly items: ReadonlyArray<OrderLineItem>,
  ) {}

  public static of(items: ReadonlyArray<OrderLineItem>): OrderLineItems {
    const [first] = items;
    if (first === undefined || items.length > MAX_LINE_ITEMS) {
      throw new InvalidInput(
        'order.invalid_line_item_count',
        `An order must have 1 to ${String(MAX_LINE_ITEMS)} line items.`,
      );
    }
    OrderLineItems.verifyUnique(items.map((item) => item.menuItemId.toString()));
    return new OrderLineItems(first, [...items]);
  }

  private static verifyUnique(menuItemIds: ReadonlyArray<string>): void {
    const duplicate = menuItemIds.find((id, index) => menuItemIds.indexOf(id) !== index);
    if (duplicate !== undefined) {
      throw new DuplicateLineItem(duplicate);
    }
  }

  public revisedWith(revisions: ReadonlyArray<RequestedLineItem>): OrderLineItems {
    OrderLineItems.verifyUnique(revisions.map((revision) => revision.menuItemId.toString()));
    const unknown = revisions.find(
      (revision) => !this.items.some((item) => item.menuItemId.equals(revision.menuItemId)),
    );
    if (unknown !== undefined) {
      throw new UnknownLineItem(unknown.menuItemId);
    }
    return OrderLineItems.of(
      this.items.map((item) => {
        const revision = revisions.find((candidate) =>
          candidate.menuItemId.equals(item.menuItemId),
        );
        return revision === undefined ? item : item.withQuantity(revision.quantity);
      }),
    );
  }

  public total(): Money {
    return this.items.slice(1).reduce((sum, item) => sum.add(item.total()), this.first.total());
  }
}
