import { Uuid } from '@ftgo/common';

export class AccountId {
  private constructor(private readonly uuid: Uuid) {}

  public static of(value: string): AccountId {
    return new AccountId(Uuid.of(value));
  }

  public equals(other: AccountId): boolean {
    return this.uuid.equals(other.uuid);
  }

  public toString(): string {
    return this.uuid.toString();
  }
}
