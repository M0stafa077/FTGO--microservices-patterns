import { InvalidInput, type Money, type Quantity } from '@ftgo/common';

import type { MenuItemId } from '../../restaurants/entities/menu-item-id.js';
import type { MenuItemName } from '../../restaurants/entities/menu-item-name.js';
import { MAX_LINE_ITEM_QUANTITY } from '../orders.constants.js';

export class OrderLineItem {
  private constructor(
    public readonly menuItemId: MenuItemId,
    public readonly name: MenuItemName,
    public readonly price: Money,
    public readonly quantity: Quantity,
  ) {}

  public static of(
    menuItemId: MenuItemId,
    name: MenuItemName,
    price: Money,
    quantity: Quantity,
  ): OrderLineItem {
    if (quantity.value > MAX_LINE_ITEM_QUANTITY) {
      throw new InvalidInput(
        'order.invalid_quantity',
        `A line item quantity must be 1 to ${String(MAX_LINE_ITEM_QUANTITY)}.`,
      );
    }
    return new OrderLineItem(menuItemId, name, price, quantity);
  }

  public total(): Money {
    return this.price.multiply(this.quantity);
  }
}
