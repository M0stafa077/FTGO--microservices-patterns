import {
  Global,
  Inject,
  Logger,
  Module,
  type DynamicModule,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';

import type { DatabaseConfig } from '../config/database.config.js';

import { ConsumerDatabase } from './consumer-database.js';
import type { ConsumerTables } from './consumer-tables.js';

@Global()
@Module({})
export class DatabaseModule implements OnApplicationShutdown {
  private static readonly logger = new Logger(DatabaseModule.name);

  public constructor(@Inject(ConsumerDatabase) private readonly database: ConsumerDatabase) {}

  public static with(config: DatabaseConfig): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: ConsumerDatabase,
          useFactory: (): ConsumerDatabase =>
            new Kysely<ConsumerTables>({
              dialect: new PostgresDialect({
                pool: config.createPool('consumer-service', (error) => {
                  DatabaseModule.logger.warn({ err: error }, 'idle database connection failed');
                }),
              }),
              plugins: [new CamelCasePlugin()],
            }),
        },
      ],
      exports: [ConsumerDatabase],
    };
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.database.destroy();
  }
}
