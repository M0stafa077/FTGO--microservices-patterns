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

import { KitchenDatabase } from './kitchen-database.js';
import type { KitchenTables } from './kitchen-tables.js';

@Global()
@Module({})
export class DatabaseModule implements OnApplicationShutdown {
  private static readonly logger = new Logger(DatabaseModule.name);

  public constructor(
    @Inject(PostgresTransactions)
    private readonly transactions: PostgresTransactions<KitchenTables>,
  ) {}

  public static with(config: DatabaseConfig): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: PostgresTransactions,
          useFactory: (): PostgresTransactions<KitchenTables> =>
            new PostgresTransactions(DatabaseModule.connect(config)),
        },
        { provide: Transactions, useExisting: PostgresTransactions },
        ...DatabaseModule.databaseViews(),
      ],
      exports: [Transactions, KitchenDatabase, MessagingDatabase],
    };
  }

  private static databaseViews(): Provider[] {
    return [
      {
        provide: KitchenDatabase,
        useFactory: (database: PostgresTransactions<KitchenTables>): KitchenDatabase => database,
        inject: [PostgresTransactions],
      },
      {
        provide: MessagingDatabase,
        useFactory: (database: PostgresTransactions<KitchenTables>): MessagingDatabase => database,
        inject: [PostgresTransactions],
      },
    ];
  }

  private static connect(config: DatabaseConfig): Kysely<KitchenTables> {
    return new Kysely<KitchenTables>({
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
