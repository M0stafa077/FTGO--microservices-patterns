import { RuleViolation } from '@ftgo/common';

export class DuplicateMenuItemId extends RuleViolation {
  public constructor(id: string) {
    super('menu.duplicate_item_id', `The menu has more than one item with id "${id}".`);
  }
}
