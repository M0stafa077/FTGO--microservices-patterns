import { Uuid } from '@ftgo/common';

export class RestaurantId {
  private constructor(private readonly uuid: Uuid) {}

  public static of(value: string): RestaurantId {
    return new RestaurantId(Uuid.of(value));
  }

  public equals(other: RestaurantId): boolean {
    return this.uuid.equals(other.uuid);
  }

  public toString(): string {
    return this.uuid.toString();
  }
}
