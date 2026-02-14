import { RuleViolation } from '@ftgo/common';

export class MixedMenuCurrencies extends RuleViolation {
  public constructor() {
    super('menu.mixed_currencies', 'All items of a menu must have the same currency.');
  }
}
