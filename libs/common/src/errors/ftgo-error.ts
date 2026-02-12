import { ErrorCategory } from './error-category.js';

export class FtgoError extends Error {
  public constructor(
    public readonly category: ErrorCategory,
    public readonly code: string,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = new.target.name;
  }
}
