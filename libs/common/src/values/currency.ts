import { CURRENCY_FORMAT } from '../common.constants.js';
import { InvalidInput } from '../errors/invalid-input.js';

export class Currency {
  private constructor(private readonly code: string) {}

  public static of(code: string): Currency {
    const normalized = code.trim().toUpperCase();
    if (!CURRENCY_FORMAT.test(normalized)) {
      throw new InvalidInput(
        'currency.invalid',
        'The currency must be a three-letter ISO 4217 code, for example USD.',
      );
    }
    return new Currency(normalized);
  }

  public equals(other: Currency): boolean {
    return this.code === other.code;
  }

  public toString(): string {
    return this.code;
  }
}
