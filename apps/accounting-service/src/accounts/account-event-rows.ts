import type { Money } from '@ftgo/common';
import type { Insertable } from 'kysely';

import type { AccountEventsTable } from '../database/tables/account-events.table.js';

import { AccountEventType } from './account-event-type.js';
import type { AccountAuthorized } from './entities/account-authorized.js';
import type { AccountEventTranslation } from './entities/account-event-translation.js';
import type { AuthorizationReversed } from './entities/authorization-reversed.js';
import type { AuthorizationRevised } from './entities/authorization-revised.js';

export class AccountEventRows implements AccountEventTranslation<Insertable<AccountEventsTable>> {
  public constructor(
    private readonly accountId: string,
    private readonly version: number,
  ) {}

  public accountAuthorized(event: AccountAuthorized): Insertable<AccountEventsTable> {
    return this.row(
      AccountEventType.AccountAuthorized,
      this.orderTotalPayload(event.orderId.toString(), event.amount),
      event.authorizedAt,
    );
  }

  public authorizationReversed(event: AuthorizationReversed): Insertable<AccountEventsTable> {
    return this.row(
      AccountEventType.AuthorizationReversed,
      JSON.stringify({ orderId: event.orderId.toString() }),
      event.reversedAt,
    );
  }

  public authorizationRevised(event: AuthorizationRevised): Insertable<AccountEventsTable> {
    return this.row(
      AccountEventType.AuthorizationRevised,
      this.orderTotalPayload(event.orderId.toString(), event.amount),
      event.revisedAt,
    );
  }

  private row(
    type: AccountEventType,
    payload: string,
    occurredAt: Date,
  ): Insertable<AccountEventsTable> {
    return { accountId: this.accountId, version: this.version, type, payload, occurredAt };
  }

  private orderTotalPayload(orderId: string, amount: Money): string {
    return JSON.stringify({
      orderId,
      orderTotal: { amount: amount.amount, currency: amount.currency.toString() },
    });
  }
}
