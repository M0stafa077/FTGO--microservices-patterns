import { RuleViolation } from '@ftgo/common';

export class InvalidMessageHandler extends RuleViolation {
  public constructor(message: string) {
    super('messaging.invalid_handler', message);
  }
}
