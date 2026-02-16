import type { Quantity } from '@ftgo/common';

import type { MenuItemId } from '../../restaurants/entities/menu-item-id.js';

export class RequestedLineItem {
  public constructor(
    public readonly menuItemId: MenuItemId,
    public readonly quantity: Quantity,
  ) {}
}
