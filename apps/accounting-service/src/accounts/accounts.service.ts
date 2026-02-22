import { Clock, Role, Transactions, type Money } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import { Accounts } from './accounts.js';
import type { AccountId } from './entities/account-id.js';
import { Account } from './entities/account.entity.js';
import type { Authorization } from './entities/authorization.js';
import type { OrderId } from './entities/order-id.js';
import { AccountNotFound } from './errors/account-not-found.js';

@Injectable()
export class AccountsService {
  public constructor(
    @Inject(Accounts) private readonly accounts: Accounts,
    @Inject(Transactions) private readonly transactions: Transactions,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async openAccount(id: AccountId): Promise<void> {
    await this.transactions.run(async () => {
      if ((await this.accounts.findById(id)) !== undefined) {
        return;
      }
      await this.accounts.add(Account.open(id, this.clock.now()));
    });
  }

  public async authorize(accountId: AccountId, orderId: OrderId, amount: Money): Promise<void> {
    await this.change(accountId, (account, now) => {
      account.authorize(orderId, amount, now);
    });
  }

  public async reverseAuthorization(
    accountId: AccountId,
    orderId: OrderId,
    amount: Money,
  ): Promise<void> {
    await this.change(accountId, (account, now) => {
      account.reverseAuthorization(orderId, amount, now);
    });
  }

  public async reviseAuthorization(
    accountId: AccountId,
    orderId: OrderId,
    amount: Money,
  ): Promise<void> {
    await this.change(accountId, (account, now) => {
      account.reviseAuthorization(orderId, amount, now);
    });
  }

  public async getAuthorization(
    accountId: AccountId,
    orderId: OrderId,
    reader: AccountId,
    readerRole: Role,
  ): Promise<Authorization> {
    const account = await this.accounts.findById(accountId);
    if (account === undefined || (readerRole !== Role.Admin && !accountId.equals(reader))) {
      throw new AccountNotFound(accountId);
    }
    return account.authorizationFor(orderId);
  }

  private async change(
    accountId: AccountId,
    operation: (account: Account, now: Date) => void,
  ): Promise<void> {
    await this.transactions.run(async () => {
      const account = await this.accounts.getById(accountId);
      operation(account, this.clock.now());
      await this.accounts.save(account);
    });
  }
}
