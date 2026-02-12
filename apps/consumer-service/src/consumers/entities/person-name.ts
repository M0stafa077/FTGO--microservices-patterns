import { InvalidInput } from '@ftgo/common';

import { PERSON_NAME_MAX_LENGTH } from '../consumers.constants.js';

export class PersonName {
  private constructor(
    public readonly firstName: string,
    public readonly lastName: string,
  ) {}

  public static of(firstName: string, lastName: string): PersonName {
    return new PersonName(PersonName.part('first', firstName), PersonName.part('last', lastName));
  }

  private static part(kind: string, value: string): string {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > PERSON_NAME_MAX_LENGTH) {
      throw new InvalidInput(
        'name.invalid',
        `The ${kind} name must have 1 to ${String(PERSON_NAME_MAX_LENGTH)} characters.`,
      );
    }
    return trimmed;
  }

  public equals(other: PersonName): boolean {
    return this.firstName === other.firstName && this.lastName === other.lastName;
  }
}
