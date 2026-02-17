import { RuleViolation } from '@ftgo/common';

export class InvalidSagaDefinition extends RuleViolation {
  public constructor(sagaType: string, reason: string) {
    super('saga.invalid_definition', `Saga definition "${sagaType}" is not valid: ${reason}`);
  }
}
