import { RuleViolation } from '@ftgo/common';

import type { MenuItemId } from '../../restaurants/entities/menu-item-id.js';

export class UnknownMenuItem extends RuleViolation {
  public constructor(id: MenuItemId) {
    super('ticket.unknown_menu_item', `The restaurant menu has no item "${id.toString()}".`);
  }
}
