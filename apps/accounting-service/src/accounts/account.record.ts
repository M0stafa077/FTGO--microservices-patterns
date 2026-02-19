import type { AccountsTable } from '../database/tables/accounts.table.js';

import { AccountId } from './entities/account-id.js';
import { Account } from './entities/account.entity.js';

export class AccountRecord {
  private constructor(private readonly row: AccountsTable) {}

  public static fromRow(row: AccountsTable): AccountRecord {
    return new AccountRecord(row);
  }

  public static from(account: Account): AccountRecord {
    return new AccountRecord({ id: account.id.toString(), openedAt: account.openedAt });
  }

  public toAccount(): Account {
    return Account.restore(AccountId.of(this.row.id), this.row.openedAt);
  }

  public accountRow(): AccountsTable {
    return { ...this.row };
  }
}
