import { Environment } from '@ftgo/common/infrastructure';
import { Kysely, PostgresDialect } from 'kysely';
import { Migrator } from 'kysely/migration';
import { pino, type Logger } from 'pino';

import { DatabaseConfig } from './config/database.config.js';
import { OrderHistoryMigrations } from './database/migrations/order-history-migrations.js';

function openDatabase(logger: Logger): Kysely<unknown> {
  const config = DatabaseConfig.fromEnvironment(new Environment(process.env));
  return new Kysely<unknown>({
    dialect: new PostgresDialect({
      pool: config.createPool('order-history-service-migrations', (error) => {
        logger.warn({ err: error }, 'idle database connection failed');
      }),
    }),
  });
}

async function migrate(): Promise<void> {
  const logger = pino({ name: 'order-history-service-migrations' });
  const database = openDatabase(logger);
  try {
    const migrator = new Migrator({ db: database, provider: new OrderHistoryMigrations() });
    const { error, results = [] } = await migrator.migrateToLatest();
    for (const result of results) {
      logger.info({ migration: result.migrationName, status: result.status }, 'migration');
    }
    if (error !== undefined) {
      logger.error({ err: error }, 'migration failed');
      process.exitCode = 1;
      return;
    }
    logger.info({ applied: results.length }, 'schema is up to date');
  } finally {
    await database.destroy();
  }
}

void migrate();
