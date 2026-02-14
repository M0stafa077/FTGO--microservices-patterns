import { InvalidInput } from '../errors/invalid-input.js';

import type { Currency } from './currency.js';

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency,
  ) {}

  public static of(amount: number, currency: Currency): Money {
    if (!Number.isSafeInteger(amount) || amount < 0) {
      throw new InvalidInput(
        'money.invalid_amount',
        'A money amount must be a whole, non-negative number of minor units.',
      );
    }
    return new Money(amount, currency);
  }

  public hasSameCurrencyAs(other: Money): boolean {
    return this.currency.equals(other.currency);
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount && this.hasSameCurrencyAs(other);
  }
}
