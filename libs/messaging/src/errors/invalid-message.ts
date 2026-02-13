import { InvalidInput, type FieldIssue } from '@ftgo/common';

export class InvalidMessage extends InvalidInput {
  public constructor(
    message: string,
    issues: ReadonlyArray<FieldIssue> = [],
    options?: ErrorOptions,
  ) {
    super('message.invalid', message, issues, options);
  }
}
