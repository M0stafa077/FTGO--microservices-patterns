import { RuleViolation } from '@ftgo/common';

export class NoActiveTransaction extends RuleViolation {
  public constructor() {
    super(
      'saga.no_transaction',
      'A saga must start inside the transaction of its business change.',
    );
  }
}
