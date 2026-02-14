import { ErrorCategory } from './error-category.js';
import { FtgoError } from './ftgo-error.js';

export class Forbidden extends FtgoError {
  public constructor(code: string, message: string, options?: ErrorOptions) {
    super(ErrorCategory.Forbidden, code, message, options);
  }
}
