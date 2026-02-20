import { ConcurrentModification } from '@ftgo/common';
import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';
import type { Insertable, Selectable } from 'kysely';

import { AccountingDatabase } from '../database/accounting-database.js';
import type { AccountEventsTable } from '../database/tables/account-events.table.js';

import { AccountRecord } from './account.record.js';
import { ACCOUNT_EVENTS_PRIMARY_KEY } from './accounts.constants.js';
import type { Accounts } from './accounts.js';
import type { AccountId } from './entities/account-id.js';
import type { Account } from './entities/account.entity.js';
import { AccountNotFound } from './errors/account-not-found.js';

@Injectable()
export class PostgresAccounts implements Accounts {
  public constructor(@Inject(AccountingDatabase) private readonly database: AccountingDatabase) {}

  public async findById(id: AccountId): Promise<Account | undefined> {
    const rows = await this.streamOf(id);
    return rows.length === 0 ? undefined : AccountRecord.fromRows(rows).toAccount();
  }

  public async getById(id: AccountId): Promise<Account> {
    const account = await this.findById(id);
    if (account === undefined) {
      throw new AccountNotFound(id);
    }
    return account;
  }

  public async add(account: Account): Promise<void> {
    await this.append(account.id, AccountRecord.openingRowsOf(account), 'add account');
  }

  public async save(account: Account): Promise<void> {
    const rows = AccountRecord.changeRowsOf(account);
    if (rows.length === 0) {
      return;
    }
    await this.append(account.id, rows, 'save account');
  }

  private async streamOf(id: AccountId): Promise<Selectable<AccountEventsTable>[]> {
    try {
      return await this.database
        .current()
        .selectFrom('accountEvents')
        .selectAll()
        .where('accountId', '=', id.toString())
        .orderBy('version')
        .execute();
    } catch (error) {
      return PostgresFailure.of(error).rethrow('load account events');
    }
  }

  private async append(
    id: AccountId,
    rows: Insertable<AccountEventsTable>[],
    operation: string,
  ): Promise<void> {
    try {
      await this.database.current().insertInto('accountEvents').values(rows).execute();
    } catch (error) {
      const failure = PostgresFailure.of(error);
      if (failure.isUniqueViolationOf(ACCOUNT_EVENTS_PRIMARY_KEY)) {
        throw new ConcurrentModification('Account', id.toString());
      }
      failure.rethrow(operation);
    }
  }
}
