import { InvalidInput } from '@ftgo/common';

import { RESTAURANT_NAME_MAX_LENGTH } from '../restaurants.constants.js';

export class RestaurantName {
  private constructor(private readonly value: string) {}

  public static of(value: string): RestaurantName {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > RESTAURANT_NAME_MAX_LENGTH) {
      throw new InvalidInput(
        'restaurant.invalid_name',
        `A restaurant name must have 1 to ${String(RESTAURANT_NAME_MAX_LENGTH)} characters.`,
      );
    }
    return new RestaurantName(trimmed);
  }

  public toString(): string {
    return this.value;
  }
}
