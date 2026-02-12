import { InvalidInput } from '@ftgo/common';

import { EMAIL_FORMAT, EMAIL_MAX_LENGTH } from '../consumers.constants.js';

export class EmailAddress {
  private constructor(private readonly value: string) {}

  public static of(value: string): EmailAddress {
    const normalized = value.trim().toLowerCase();
    if (normalized.length > EMAIL_MAX_LENGTH || !EMAIL_FORMAT.test(normalized)) {
      throw new InvalidInput('email.invalid', 'The email address is not valid.');
    }
    return new EmailAddress(normalized);
  }

  public equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
