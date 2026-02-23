import type { Money, Quantity } from '@ftgo/common';

export class HistoryLineItem {
  private constructor(
    public readonly menuItemId: string,
    public readonly name: string,
    public readonly price: Money,
    public readonly quantity: Quantity,
  ) {}

  public static of(
    menuItemId: string,
    name: string,
    price: Money,
    quantity: Quantity,
  ): HistoryLineItem {
    return new HistoryLineItem(menuItemId, name, price, quantity);
  }
}
