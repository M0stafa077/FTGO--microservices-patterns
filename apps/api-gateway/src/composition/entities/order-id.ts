import { Uuid } from '@ftgo/common';

export class OrderId {
  private constructor(private readonly uuid: Uuid) {}

  public static of(value: string): OrderId {
    return new OrderId(Uuid.of(value));
  }

  public toString(): string {
    return this.uuid.toString();
  }
}
