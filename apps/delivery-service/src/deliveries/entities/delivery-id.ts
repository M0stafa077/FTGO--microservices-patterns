import { Uuid } from '@ftgo/common';

export class DeliveryId {
  private constructor(private readonly uuid: Uuid) {}

  public static of(value: string): DeliveryId {
    return new DeliveryId(Uuid.of(value));
  }

  public equals(other: DeliveryId): boolean {
    return this.uuid.equals(other.uuid);
  }

  public toString(): string {
    return this.uuid.toString();
  }
}
