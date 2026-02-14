import { RuleViolation } from '@ftgo/common';

export class DuplicateMenuItemName extends RuleViolation {
  public constructor(name: string) {
    super('menu.duplicate_item_name', `The menu has more than one item named "${name}".`);
  }
}
