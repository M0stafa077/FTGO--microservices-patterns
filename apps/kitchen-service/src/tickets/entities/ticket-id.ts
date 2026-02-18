import { Uuid } from '@ftgo/common';

export class TicketId {
  private constructor(private readonly uuid: Uuid) {}

  public static of(value: string): TicketId {
    return new TicketId(Uuid.of(value));
  }

  public equals(other: TicketId): boolean {
    return this.uuid.equals(other.uuid);
  }

  public toString(): string {
    return this.uuid.toString();
  }
}
