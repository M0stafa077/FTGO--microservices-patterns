import type { Money } from '@ftgo/common';

import { AccountAuthorized } from './account-authorized.js';
import type { AccountEvent } from './account-event.js';
import type { AccountId } from './account-id.js';
import { AuthorizationLedger } from './authorization-ledger.js';
import { AuthorizationReversed } from './authorization-reversed.js';
import { AuthorizationRevised } from './authorization-revised.js';
import type { OrderId } from './order-id.js';

export class Account {
  private readonly ledger = new AuthorizationLedger();
  private readonly pendingEvents: AccountEvent[] = [];

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
    history: ReadonlyArray<AccountEvent>,
  ): Account {
    const account = new Account(id, openedAt, history.length + 1);
    for (const event of history) {
      event.translate(account.ledger);
    }
    return account;
  }

  public authorize(orderId: OrderId, amount: Money, now: Date): void {
    const existing = this.ledger.find(orderId);
    if (existing === undefined) {
      this.record(new AccountAuthorized(orderId, amount, now));
      return;
    }
    existing.verifyActive();
    existing.verifyAmount(amount);
  }

  public reverseAuthorization(orderId: OrderId, amount: Money, now: Date): void {
    const authorization = this.ledger.get(orderId);
    if (authorization.isReversed) {
      return;
    }
    authorization.verifyAmount(amount);
    this.record(new AuthorizationReversed(orderId, now));
  }

  public reviseAuthorization(orderId: OrderId, amount: Money, now: Date): void {
    const authorization = this.ledger.get(orderId);
    authorization.verifyActive();
    if (authorization.amount.equals(amount)) {
      return;
    }
    this.record(new AuthorizationRevised(orderId, amount, now));
  }

  public releaseEvents(): ReadonlyArray<AccountEvent> {
    return this.pendingEvents.splice(0);
  }

  private record(event: AccountEvent): void {
    event.translate(this.ledger);
    this.pendingEvents.push(event);
  }
}
