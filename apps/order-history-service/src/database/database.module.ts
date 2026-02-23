import { Transactions } from '@ftgo/common';
import { PostgresTransactions } from '@ftgo/common/infrastructure';
import { MessagingDatabase } from '@ftgo/messaging/infrastructure';
import {
  Global,
  Inject,
  Logger,
  Module,
  type DynamicModule,
  type OnApplicationShutdown,
  type Provider,
} from '@nestjs/common';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';

import { SERVICE_NAME } from '../app.constants.js';
import type { DatabaseConfig } from '../config/database.config.js';

import { OrderHistoryDatabase } from './order-history-database.js';
import type { OrderHistoryTables } from './order-history-tables.js';

@Global()
@Module({})
export class DatabaseModule implements OnApplicationShutdown {
  private static readonly logger = new Logger(DatabaseModule.name);

  public constructor(
    @Inject(PostgresTransactions)
    private readonly transactions: PostgresTransactions<OrderHistoryTables>,
  ) {}

  public static with(config: DatabaseConfig): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: PostgresTransactions,
          useFactory: (): PostgresTransactions<OrderHistoryTables> =>
            new PostgresTransactions(DatabaseModule.connect(config)),
        },
        { provide: Transactions, useExisting: PostgresTransactions },
        ...DatabaseModule.databaseViews(),
      ],
      exports: [Transactions, OrderHistoryDatabase, MessagingDatabase],
    };
  }

  private static databaseViews(): Provider[] {
    return [
      {
        provide: OrderHistoryDatabase,
        useFactory: (database: PostgresTransactions<OrderHistoryTables>): OrderHistoryDatabase =>
          database,
        inject: [PostgresTransactions],
      },
      {
        provide: MessagingDatabase,
        useFactory: (database: PostgresTransactions<OrderHistoryTables>): MessagingDatabase =>
          database,
        inject: [PostgresTransactions],
      },
    ];
  }

  private static connect(config: DatabaseConfig): Kysely<OrderHistoryTables> {
    return new Kysely<OrderHistoryTables>({
      dialect: new PostgresDialect({
        pool: config.createPool(SERVICE_NAME, (error) => {
          DatabaseModule.logger.warn({ err: error }, 'idle database connection failed');
        }),
      }),
      plugins: [new CamelCasePlugin({ maintainNestedObjectKeys: true })],
    });
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.transactions.close();
  }
}
