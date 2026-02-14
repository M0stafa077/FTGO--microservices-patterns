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

import { RestaurantDatabase } from './restaurant-database.js';
import type { RestaurantTables } from './restaurant-tables.js';

@Global()
@Module({})
export class DatabaseModule implements OnApplicationShutdown {
  private static readonly logger = new Logger(DatabaseModule.name);

  public constructor(
    @Inject(PostgresTransactions)
    private readonly transactions: PostgresTransactions<RestaurantTables>,
  ) {}

  public static with(config: DatabaseConfig): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: PostgresTransactions,
          useFactory: (): PostgresTransactions<RestaurantTables> =>
            new PostgresTransactions(DatabaseModule.connect(config)),
        },
        { provide: Transactions, useExisting: PostgresTransactions },
        ...DatabaseModule.databaseViews(),
      ],
      exports: [Transactions, RestaurantDatabase, MessagingDatabase],
    };
  }

  private static databaseViews(): Provider[] {
    return [
      {
        provide: RestaurantDatabase,
        useFactory: (database: PostgresTransactions<RestaurantTables>): RestaurantDatabase =>
          database,
        inject: [PostgresTransactions],
      },
      {
        provide: MessagingDatabase,
        useFactory: (database: PostgresTransactions<RestaurantTables>): MessagingDatabase =>
          database,
        inject: [PostgresTransactions],
      },
    ];
  }

  private static connect(config: DatabaseConfig): Kysely<RestaurantTables> {
    return new Kysely<RestaurantTables>({
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
