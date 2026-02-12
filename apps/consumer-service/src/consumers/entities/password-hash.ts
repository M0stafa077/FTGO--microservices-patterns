import { InvalidInput, REDACTED } from '@ftgo/common';

export class PasswordHash {
  private constructor(private readonly value: string) {}

  public static of(value: string): PasswordHash {
    if (!value.startsWith('$')) {
      throw new InvalidInput(
        'password_hash.invalid',
        'The password hash is not in PHC string format.',
      );
    }
    return new PasswordHash(value);
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
