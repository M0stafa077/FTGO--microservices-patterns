import type { Currency } from '../values/currency.js';

import { RuleViolation } from './rule-violation.js';

export class CurrencyMismatch extends RuleViolation {
  public constructor(left: Currency, right: Currency) {
    super(
      'money.currency_mismatch',
      `Amounts in ${left.toString()} and ${right.toString()} cannot be combined.`,
    );
  }
}
