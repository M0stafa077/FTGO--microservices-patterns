import { Uuid } from '@ftgo/common';

export class ConsumerId {
  private constructor(private readonly uuid: Uuid) {}

  public static of(value: string): ConsumerId {
    return new ConsumerId(Uuid.of(value));
  }

  public equals(other: ConsumerId): boolean {
    return this.uuid.equals(other.uuid);
  }

  public toString(): string {
    return this.uuid.toString();
  }
}
