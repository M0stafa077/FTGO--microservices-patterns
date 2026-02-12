import { InvalidInput, REDACTED } from '@ftgo/common';

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../consumers.constants.js';

export class Password {
  private constructor(private readonly value: string) {}

  public static of(value: string): Password {
    const length = Array.from(value).length;
    if (length < PASSWORD_MIN_LENGTH || length > PASSWORD_MAX_LENGTH) {
      throw new InvalidInput(
        'password.invalid_length',
        `The password must have ${String(PASSWORD_MIN_LENGTH)} to ${String(PASSWORD_MAX_LENGTH)} characters.`,
      );
    }
    return new Password(value);
  }

  public static candidate(value: string): Password {
    return new Password(value);
  }

  public reveal(): string {
    return this.value;
  }

  public toString(): string {
    return REDACTED;
  }

  public toJSON(): string {
    return REDACTED;
  }
}
