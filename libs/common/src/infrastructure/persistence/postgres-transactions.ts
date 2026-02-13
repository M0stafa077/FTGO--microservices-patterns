import { AsyncLocalStorage } from 'node:async_hooks';

import type { Kysely, Transaction } from 'kysely';

import { FtgoError } from '../../errors/ftgo-error.js';
import type { Transactions } from '../../persistence/transactions.js';

import { PostgresFailure } from './postgres-failure.js';

export class PostgresTransactions<Tables> implements Transactions {
  private readonly active = new AsyncLocalStorage<Transaction<Tables>>();

  public constructor(private readonly root: Kysely<Tables>) {}

  public current(): Kysely<Tables> {
    return this.active.getStore() ?? this.root;
  }

  public async run<T>(work: () => Promise<T>): Promise<T> {
    if (this.active.getStore() !== undefined) {
      return work();
    }
    try {
      return await this.root
        .transaction()
        .execute(async (transaction) => this.active.run(transaction, work));
    } catch (error) {
      if (error instanceof FtgoError) {
        throw error;
      }
      return PostgresFailure.of(error).rethrow('transaction');
    }
  }

  public async close(): Promise<void> {
    await this.root.destroy();
  }
}
