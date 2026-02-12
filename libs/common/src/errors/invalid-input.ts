import { ErrorCategory } from './error-category.js';
import type { FieldIssue } from './field-issue.js';
import { FtgoError } from './ftgo-error.js';

export class InvalidInput extends FtgoError {
  public constructor(
    code: string,
    message: string,
    public readonly issues: ReadonlyArray<FieldIssue> = [],
    options?: ErrorOptions,
  ) {
    super(ErrorCategory.InvalidInput, code, message, options);
  }
}
