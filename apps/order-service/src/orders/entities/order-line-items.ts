import { InvalidInput, type Money } from '@ftgo/common';

import { DuplicateLineItem } from '../errors/duplicate-line-item.js';
import { MAX_LINE_ITEMS } from '../orders.constants.js';

import type { OrderLineItem } from './order-line-item.js';

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
    const menuItemIds = items.map((item) => item.menuItemId.toString());
    const duplicate = menuItemIds.find((id, index) => menuItemIds.indexOf(id) !== index);
    if (duplicate !== undefined) {
      throw new DuplicateLineItem(duplicate);
    }
    return new OrderLineItems(first, [...items]);
  }

  public total(): Money {
    return this.items.slice(1).reduce((sum, item) => sum.add(item.total()), this.first.total());
  }
}
