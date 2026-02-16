import { Uuid } from '@ftgo/common';

export class OrderId {
  private constructor(private readonly uuid: Uuid) {}

  public static generate(): OrderId {
    return new OrderId(Uuid.generate());
  }

  public static of(value: string): OrderId {
    return new OrderId(Uuid.of(value));
  }

  public equals(other: OrderId): boolean {
    return this.uuid.equals(other.uuid);
  }

  public toString(): string {
    return this.uuid.toString();
  }
}
