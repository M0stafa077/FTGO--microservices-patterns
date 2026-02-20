import { Clock, Transactions, type Money } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import { Accounts } from './accounts.js';
import type { AccountId } from './entities/account-id.js';
import { Account } from './entities/account.entity.js';
import type { OrderId } from './entities/order-id.js';

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
    await this.transactions.run(async () => {
      const account = await this.accounts.getById(accountId);
      account.authorize(orderId, amount, this.clock.now());
      await this.accounts.save(account);
    });
  }
}
