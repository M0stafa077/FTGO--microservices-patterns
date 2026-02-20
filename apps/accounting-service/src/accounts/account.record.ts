import { Currency, InvalidInput, Money } from '@ftgo/common';
import { CompiledSchema } from '@ftgo/common/infrastructure';
import type { Insertable, Selectable } from 'kysely';
import type { Static, TSchema } from 'typebox';
import { Value } from 'typebox/value';

import type { AccountEventsTable } from '../database/tables/account-events.table.js';

import { ACCOUNT_AUTHORIZED, ACCOUNT_CREATED } from './accounts.constants.js';
import { AccountAuthorized } from './entities/account-authorized.js';
import { AccountId } from './entities/account-id.js';
import { Account } from './entities/account.entity.js';
import { OrderId } from './entities/order-id.js';
import { AccountAuthorizedPayload } from './schemas/account-authorized-payload.schema.js';
import { AccountCreatedPayload } from './schemas/account-created-payload.schema.js';

export class AccountRecord {
  private constructor(private readonly rows: ReadonlyArray<Selectable<AccountEventsTable>>) {}

  public static fromRows(rows: ReadonlyArray<Selectable<AccountEventsTable>>): AccountRecord {
    return new AccountRecord(rows);
  }

  public static openingRowsOf(account: Account): Insertable<AccountEventsTable>[] {
    const created: Insertable<AccountEventsTable> = {
      accountId: account.id.toString(),
      version: 1,
      type: ACCOUNT_CREATED,
      payload: JSON.stringify({}),
      occurredAt: account.openedAt,
    };
    return [created, ...AccountRecord.pendingRowsOf(account, 1)];
  }

  public static changeRowsOf(account: Account): Insertable<AccountEventsTable>[] {
    return AccountRecord.pendingRowsOf(account, account.version);
  }

  private static pendingRowsOf(
    account: Account,
    lastVersion: number,
  ): Insertable<AccountEventsTable>[] {
    return account.releaseEvents().map((event, index) => ({
      accountId: account.id.toString(),
      version: lastVersion + index + 1,
      type: ACCOUNT_AUTHORIZED,
      payload: JSON.stringify({
        orderId: event.orderId.toString(),
        orderTotal: { amount: event.amount.amount, currency: event.amount.currency.toString() },
      }),
      occurredAt: event.authorizedAt,
    }));
  }

  public toAccount(): Account {
    const [created, ...history] = this.rows;
    if (created?.type !== ACCOUNT_CREATED) {
      throw new InvalidInput(
        'account.invalid_event',
        'An account stream must start with AccountCreated.',
      );
    }
    this.payloadOf(AccountCreatedPayload, created);
    return Account.replay(
      AccountId.of(created.accountId),
      created.occurredAt,
      history.map((row) => this.toAccountAuthorized(row)),
    );
  }

  private toAccountAuthorized(row: Selectable<AccountEventsTable>): AccountAuthorized {
    if (row.type !== ACCOUNT_AUTHORIZED) {
      throw new InvalidInput(
        'account.invalid_event',
        `Event ${String(row.version)} of account ${row.accountId} has the unexpected type "${row.type}".`,
      );
    }
    const { orderId, orderTotal } = this.payloadOf(AccountAuthorizedPayload, row);
    return new AccountAuthorized(
      OrderId.of(orderId),
      Money.of(orderTotal.amount, Currency.of(orderTotal.currency)),
      row.occurredAt,
    );
  }

  private payloadOf<Schema extends TSchema>(
    schema: Schema,
    row: Selectable<AccountEventsTable>,
  ): Static<Schema> {
    if (Value.Check(schema, row.payload)) {
      return row.payload;
    }
    throw new CompiledSchema(schema).rejectionOf(
      row.payload,
      'account.invalid_event',
      `Event ${String(row.version)} of account ${row.accountId} does not match the ${row.type} schema.`,
    );
  }
}
