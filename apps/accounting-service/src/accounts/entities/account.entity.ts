import type { Money } from '@ftgo/common';

import { AuthorizationMismatch } from '../errors/authorization-mismatch.js';

import { AccountAuthorized } from './account-authorized.js';
import type { AccountId } from './account-id.js';
import type { OrderId } from './order-id.js';

export class Account {
  private readonly authorizedAmounts = new Map<string, Money>();
  private readonly pendingEvents: AccountAuthorized[] = [];

  private constructor(
    public readonly id: AccountId,
    public readonly openedAt: Date,
    public readonly version: number,
  ) {}

  public static open(id: AccountId, now: Date): Account {
    return new Account(id, now, 0);
  }

  public static replay(
    id: AccountId,
    openedAt: Date,
    history: ReadonlyArray<AccountAuthorized>,
  ): Account {
    const account = new Account(id, openedAt, history.length + 1);
    for (const event of history) {
      account.apply(event);
    }
    return account;
  }

  public authorize(orderId: OrderId, amount: Money, now: Date): void {
    const authorized = this.authorizedAmounts.get(orderId.toString());
    if (authorized === undefined) {
      this.record(new AccountAuthorized(orderId, amount, now));
      return;
    }
    if (!authorized.equals(amount)) {
      throw new AuthorizationMismatch(orderId);
    }
  }

  public releaseEvents(): ReadonlyArray<AccountAuthorized> {
    return this.pendingEvents.splice(0);
  }

  private record(event: AccountAuthorized): void {
    this.apply(event);
    this.pendingEvents.push(event);
  }

  private apply(event: AccountAuthorized): void {
    this.authorizedAmounts.set(event.orderId.toString(), event.amount);
  }
}
