import { ErrorCategory } from './error-category.js';
import { FtgoError } from './ftgo-error.js';

export class RuleViolation extends FtgoError {
  public constructor(code: string, message: string, options?: ErrorOptions) {
    super(ErrorCategory.RuleViolation, code, message, options);
  }
}
