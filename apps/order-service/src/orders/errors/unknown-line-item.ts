import { RuleViolation } from '@ftgo/common';

import type { MenuItemId } from '../../restaurants/entities/menu-item-id.js';

export class UnknownLineItem extends RuleViolation {
  public constructor(menuItemId: MenuItemId) {
    super(
      'order.unknown_line_item',
      `The order has no line item for menu item "${menuItemId.toString()}".`,
    );
  }
}
