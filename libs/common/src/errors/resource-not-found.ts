import { ErrorCategory } from './error-category.js';
import { FtgoError } from './ftgo-error.js';

export class ResourceNotFound extends FtgoError {
  public constructor(code: string, message: string, options?: ErrorOptions) {
    super(ErrorCategory.NotFound, code, message, options);
  }
}
