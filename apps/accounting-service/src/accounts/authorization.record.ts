import { Currency, Money } from '@ftgo/common';
import type { Insertable, Selectable } from 'kysely';

import type { AuthorizationsTable } from '../database/tables/authorizations.table.js';

import { AccountId } from './entities/account-id.js';
import { Authorization } from './entities/authorization.entity.js';
import { OrderId } from './entities/order-id.js';

export class AuthorizationRecord {
  private constructor(private readonly row: Selectable<AuthorizationsTable>) {}

  public static fromRow(row: Selectable<AuthorizationsTable>): AuthorizationRecord {
    return new AuthorizationRecord(row);
  }

  public static insertRowOf(authorization: Authorization): Insertable<AuthorizationsTable> {
    return {
      orderId: authorization.orderId.toString(),
      accountId: authorization.accountId.toString(),
      amount: authorization.amount.amount,
      currency: authorization.amount.currency.toString(),
      authorizedAt: authorization.authorizedAt,
    };
  }

  public toAuthorization(): Authorization {
    return Authorization.restore({
      orderId: OrderId.of(this.row.orderId),
      accountId: AccountId.of(this.row.accountId),
      amount: Money.of(Number(this.row.amount), Currency.of(this.row.currency)),
      authorizedAt: this.row.authorizedAt,
    });
  }
}
