import { Currency, InvalidInput, Money } from '@ftgo/common';
import { CompiledSchema } from '@ftgo/common/infrastructure';
import type { Money as MoneyPayload } from '@ftgo/contracts';
import type { Insertable, Selectable } from 'kysely';
import type { Static, TSchema } from 'typebox';
import { Value } from 'typebox/value';

import type { AccountEventsTable } from '../database/tables/account-events.table.js';

import { AccountEventRows } from './account-event-rows.js';
import { AccountEventType } from './account-event-type.js';
import { ACCOUNT_EVENT_TYPES } from './accounts.constants.js';
import { AccountAuthorized } from './entities/account-authorized.js';
import type { AccountEvent } from './entities/account-event.js';
import { AccountId } from './entities/account-id.js';
import { Account } from './entities/account.entity.js';
import { AuthorizationReversed } from './entities/authorization-reversed.js';
import { AuthorizationRevised } from './entities/authorization-revised.js';
import { OrderId } from './entities/order-id.js';
import { AccountAuthorizedPayload } from './schemas/account-authorized-payload.schema.js';
import { AccountCreatedPayload } from './schemas/account-created-payload.schema.js';
import { AuthorizationReversedPayload } from './schemas/authorization-reversed-payload.schema.js';
import { AuthorizationRevisedPayload } from './schemas/authorization-revised-payload.schema.js';

export class AccountRecord {
  private constructor(private readonly rows: ReadonlyArray<Selectable<AccountEventsTable>>) {}

  public static fromRows(rows: ReadonlyArray<Selectable<AccountEventsTable>>): AccountRecord {
    return new AccountRecord(rows);
  }

  public static openingRowsOf(account: Account): Insertable<AccountEventsTable>[] {
    const created: Insertable<AccountEventsTable> = {
      accountId: account.id.toString(),
      version: 1,
      type: AccountEventType.AccountCreated,
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
    return account
      .releaseEvents()
      .map((event, index) =>
        event.translate(new AccountEventRows(account.id.toString(), lastVersion + index + 1)),
      );
  }

  public toAccount(): Account {
    const [created, ...history] = this.rows;
    if (created === undefined || this.typeOf(created) !== AccountEventType.AccountCreated) {
      throw new InvalidInput(
        'account.invalid_event',
        'An account stream must start with AccountCreated.',
      );
    }
    this.payloadOf(AccountCreatedPayload, created);
    return Account.replay(
      AccountId.of(created.accountId),
      created.occurredAt,
      history.map((row) => this.toEvent(row)),
    );
  }

  private toEvent(row: Selectable<AccountEventsTable>): AccountEvent {
    const type = this.typeOf(row);
    switch (type) {
      case AccountEventType.AccountAuthorized:
        return this.accountAuthorized(row);
      case AccountEventType.AuthorizationReversed:
        return this.authorizationReversed(row);
      case AccountEventType.AuthorizationRevised:
        return this.authorizationRevised(row);
      case AccountEventType.AccountCreated:
        throw this.invalid(row, 'AccountCreated may only be the first event');
      default: {
        const unreachable: never = type;
        throw this.invalid(row, `"${String(unreachable)}" is not an account event`);
      }
    }
  }

  private accountAuthorized(row: Selectable<AccountEventsTable>): AccountAuthorized {
    const { orderId, orderTotal } = this.payloadOf(AccountAuthorizedPayload, row);
    return new AccountAuthorized(OrderId.of(orderId), this.moneyOf(orderTotal), row.occurredAt);
  }

  private authorizationReversed(row: Selectable<AccountEventsTable>): AuthorizationReversed {
    const { orderId } = this.payloadOf(AuthorizationReversedPayload, row);
    return new AuthorizationReversed(OrderId.of(orderId), row.occurredAt);
  }

  private authorizationRevised(row: Selectable<AccountEventsTable>): AuthorizationRevised {
    const { orderId, orderTotal } = this.payloadOf(AuthorizationRevisedPayload, row);
    return new AuthorizationRevised(OrderId.of(orderId), this.moneyOf(orderTotal), row.occurredAt);
  }

  private typeOf(row: Selectable<AccountEventsTable>): AccountEventType {
    const type = ACCOUNT_EVENT_TYPES.get(row.type);
    if (type === undefined) {
      throw this.invalid(row, `"${row.type}" is not an account event`);
    }
    return type;
  }

  private moneyOf(total: MoneyPayload): Money {
    return Money.of(total.amount, Currency.of(total.currency));
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

  private invalid(row: Selectable<AccountEventsTable>, reason: string): InvalidInput {
    return new InvalidInput(
      'account.invalid_event',
      `Event ${String(row.version)} of account ${row.accountId}: ${reason}.`,
    );
  }
}
