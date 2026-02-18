import { RuleViolation } from '@ftgo/common';

export class DuplicateLineItem extends RuleViolation {
  public constructor(menuItemId: string) {
    super(
      'ticket.duplicate_line_item',
      `The ticket has more than one line item for menu item "${menuItemId}".`,
    );
  }
}
