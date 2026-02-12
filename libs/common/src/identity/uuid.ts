import { randomUUID } from 'node:crypto';

import { UUID_FORMAT } from '../common.constants.js';
import { InvalidInput } from '../errors/invalid-input.js';

export class Uuid {
  private constructor(private readonly value: string) {}

  public static generate(): Uuid {
    return new Uuid(randomUUID());
  }

  public static of(value: string): Uuid {
    const normalized = value.toLowerCase();
    if (!Uuid.isValid(normalized)) {
      throw new InvalidInput('uuid.invalid', 'The value is not a valid UUID.');
    }
    return new Uuid(normalized);
  }

  public static isValid(value: string): boolean {
    return UUID_FORMAT.test(value.toLowerCase());
  }

  public equals(other: Uuid): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
