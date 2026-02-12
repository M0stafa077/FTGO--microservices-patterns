import { InvalidInput } from '@ftgo/common';

import { PHONE_NUMBER_FORMAT } from '../consumers.constants.js';

export class PhoneNumber {
  private constructor(private readonly value: string) {}

  public static of(value: string): PhoneNumber {
    const compact = value.replace(/[\s-]/g, '');
    if (!PHONE_NUMBER_FORMAT.test(compact)) {
      throw new InvalidInput(
        'phone_number.invalid',
        'The phone number must be in E.164 format, for example +201001234567.',
      );
    }
    return new PhoneNumber(compact);
  }

  public static ofOptional(value: string | undefined): PhoneNumber | undefined {
    return value === undefined ? undefined : PhoneNumber.of(value);
  }

  public toString(): string {
    return this.value;
  }
}
