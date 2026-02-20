import type { Quantity } from '@ftgo/common';

import type { MenuItemId } from '../../restaurants/entities/menu-item-id.js';

export class RevisedLineItem {
  public constructor(
    public readonly menuItemId: MenuItemId,
    public readonly quantity: Quantity,
  ) {}
}
