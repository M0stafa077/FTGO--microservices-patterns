import { Uuid } from '@ftgo/common';

export class CourierId {
  private constructor(private readonly uuid: Uuid) {}

  public static of(value: string): CourierId {
    return new CourierId(Uuid.of(value));
  }

  public equals(other: CourierId): boolean {
    return this.uuid.equals(other.uuid);
  }

  public toString(): string {
    return this.uuid.toString();
  }
}
