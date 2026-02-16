import { RuleViolation } from '@ftgo/common';

export class DuplicateLineItem extends RuleViolation {
  public constructor(menuItemId: string) {
    super(
      'order.duplicate_line_item',
      `The order has more than one line item for menu item "${menuItemId}".`,
    );
  }
}
