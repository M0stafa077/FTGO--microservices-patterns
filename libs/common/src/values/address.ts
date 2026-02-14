import { ADDRESS_LINE_MAX_LENGTH, ZIP_CODE_MAX_LENGTH } from '../common.constants.js';
import { InvalidInput } from '../errors/invalid-input.js';

export class Address {
  private constructor(
    public readonly street1: string,
    public readonly street2: string | undefined,
    public readonly city: string,
    public readonly state: string,
    public readonly zip: string,
  ) {}

  public static of(lines: {
    readonly street1: string;
    readonly street2?: string | undefined;
    readonly city: string;
    readonly state: string;
    readonly zip: string;
  }): Address {
    const street2 = lines.street2?.trim() ?? '';
    return new Address(
      Address.field('street1', lines.street1, ADDRESS_LINE_MAX_LENGTH),
      street2.length === 0 ? undefined : Address.field('street2', street2, ADDRESS_LINE_MAX_LENGTH),
      Address.field('city', lines.city, ADDRESS_LINE_MAX_LENGTH),
      Address.field('state', lines.state, ADDRESS_LINE_MAX_LENGTH),
      Address.field('zip', lines.zip, ZIP_CODE_MAX_LENGTH),
    );
  }

  private static field(name: string, value: string, maxLength: number): string {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > maxLength) {
      throw new InvalidInput(
        'address.invalid',
        `The address ${name} must have 1 to ${String(maxLength)} characters.`,
      );
    }
    return trimmed;
  }
}
