import { ErrorCategory } from './error-category.js';
import { FtgoError } from './ftgo-error.js';

export class Unauthenticated extends FtgoError {
  public constructor(code: string, message: string, options?: ErrorOptions) {
    super(ErrorCategory.Unauthenticated, code, message, options);
  }
}
