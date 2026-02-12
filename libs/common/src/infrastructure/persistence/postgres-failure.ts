import { ServiceUnavailable } from '../../errors/service-unavailable.js';
import {
  TRANSIENT_CONNECTION_MESSAGES,
  TRANSIENT_NETWORK_CODES,
  TRANSIENT_SQL_STATES,
  UNIQUE_VIOLATION_CODE,
} from '../infrastructure.constants.js';

export class PostgresFailure {
  private constructor(
    private readonly error: unknown,
    private readonly code: string | undefined,
    private readonly constraint: string | undefined,
  ) {}

  public static of(error: unknown): PostgresFailure {
    return new PostgresFailure(
      error,
      PostgresFailure.stringField(error, 'code'),
      PostgresFailure.stringField(error, 'constraint'),
    );
  }

  private static stringField(error: unknown, field: string): string | undefined {
    if (typeof error !== 'object' || error === null || !(field in error)) {
      return undefined;
    }
    const value: unknown = Reflect.get(error, field);
    return typeof value === 'string' ? value : undefined;
  }

  public isUniqueViolationOf(constraint: string): boolean {
    return this.code === UNIQUE_VIOLATION_CODE && this.constraint === constraint;
  }

  public rethrow(operation: string): never {
    if (this.isTransient()) {
      throw new ServiceUnavailable(
        'database.unavailable',
        `Database unavailable during "${operation}".`,
        {
          cause: this.error,
        },
      );
    }
    throw this.error;
  }

  private isTransient(): boolean {
    if (this.code !== undefined) {
      return TRANSIENT_SQL_STATES.test(this.code) || TRANSIENT_NETWORK_CODES.has(this.code);
    }
    return this.error instanceof Error && TRANSIENT_CONNECTION_MESSAGES.test(this.error.message);
  }
}
