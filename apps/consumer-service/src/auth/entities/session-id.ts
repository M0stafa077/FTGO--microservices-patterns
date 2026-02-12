import { Uuid } from '@ftgo/common';

export class SessionId {
  private constructor(private readonly uuid: Uuid) {}

  public static generate(): SessionId {
    return new SessionId(Uuid.generate());
  }

  public static of(value: string): SessionId {
    return new SessionId(Uuid.of(value));
  }

  public equals(other: SessionId): boolean {
    return this.uuid.equals(other.uuid);
  }

  public toString(): string {
    return this.uuid.toString();
  }
}
