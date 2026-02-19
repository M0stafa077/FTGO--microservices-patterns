import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { AccountingDatabase } from '../database/accounting-database.js';

import { AccountRecord } from './account.record.js';
import type { Accounts } from './accounts.js';
import type { AccountId } from './entities/account-id.js';
import type { Account } from './entities/account.entity.js';
import { AccountNotFound } from './errors/account-not-found.js';

@Injectable()
export class PostgresAccounts implements Accounts {
  public constructor(@Inject(AccountingDatabase) private readonly database: AccountingDatabase) {}

  public async findById(id: AccountId): Promise<Account | undefined> {
    try {
      const row = await this.database
        .current()
        .selectFrom('accounts')
        .selectAll()
        .where('id', '=', id.toString())
        .executeTakeFirst();
      return row === undefined ? undefined : AccountRecord.fromRow(row).toAccount();
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find account');
    }
  }

  public async getById(id: AccountId): Promise<Account> {
    const account = await this.findById(id);
    if (account === undefined) {
      throw new AccountNotFound(id);
    }
    return account;
  }

  public async add(account: Account): Promise<void> {
    try {
      await this.database
        .current()
        .insertInto('accounts')
        .values(AccountRecord.from(account).accountRow())
        .execute();
    } catch (error) {
      PostgresFailure.of(error).rethrow('add account');
    }
  }
}
