import type { AccountId } from './entities/account-id.js';
import type { Account } from './entities/account.entity.js';

export interface Accounts {
  findById(id: AccountId): Promise<Account | undefined>;

  getById(id: AccountId): Promise<Account>;

  add(account: Account): Promise<void>;
}
export const Accounts = Symbol('Accounts');
