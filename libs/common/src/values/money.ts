import { CurrencyMismatch } from '../errors/currency-mismatch.js';
import { InvalidInput } from '../errors/invalid-input.js';

import type { Currency } from './currency.js';
import type { Quantity } from './quantity.js';

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

  public add(other: Money): Money {
    if (!this.hasSameCurrencyAs(other)) {
      throw new CurrencyMismatch(this.currency, other.currency);
    }
    return Money.of(this.amount + other.amount, this.currency);
  }

  public multiply(quantity: Quantity): Money {
    return Money.of(this.amount * quantity.value, this.currency);
  }

  public hasSameCurrencyAs(other: Money): boolean {
    return this.currency.equals(other.currency);
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount && this.hasSameCurrencyAs(other);
  }
}
