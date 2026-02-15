import { InvalidInput } from '../errors/invalid-input.js';

export class Quantity {
  private constructor(public readonly value: number) {}

  public static of(value: number): Quantity {
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new InvalidInput(
        'quantity.invalid',
        'A quantity must be a whole number of at least 1.',
      );
    }
    return new Quantity(value);
  }

  public equals(other: Quantity): boolean {
    return this.value === other.value;
  }
}
