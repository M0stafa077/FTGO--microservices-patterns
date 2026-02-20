import { RuleViolation } from '@ftgo/common';

import type { MenuItemId } from '../../restaurants/entities/menu-item-id.js';

export class UnknownLineItem extends RuleViolation {
  public constructor(menuItemId: MenuItemId) {
    super(
      'ticket.unknown_line_item',
      `The ticket has no line item for menu item "${menuItemId.toString()}".`,
    );
  }
}
