import { ErrorCategory } from './error-category.js';
import { FtgoError } from './ftgo-error.js';

export class Conflict extends FtgoError {
  public constructor(code: string, message: string, options?: ErrorOptions) {
    super(ErrorCategory.Conflict, code, message, options);
  }
}
