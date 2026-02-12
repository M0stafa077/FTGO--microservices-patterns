import { Environment } from '@ftgo/common/infrastructure';
import { Kysely, PostgresDialect } from 'kysely';
import { Migrator } from 'kysely/migration';
import { pino, type Logger } from 'pino';

import { DatabaseConfig } from './config/database.config.js';
import { ConsumerMigrations } from './database/migrations/consumer-migrations.js';

function openDatabase(logger: Logger): Kysely<unknown> {
  const config = DatabaseConfig.fromEnvironment(new Environment(process.env));
  return new Kysely<unknown>({
    dialect: new PostgresDialect({
      pool: config.createPool('consumer-service-migrations', (error) => {
        logger.warn({ err: error }, 'idle database connection failed');
      }),
    }),
  });
}

async function migrate(): Promise<void> {
  const logger = pino({ name: 'consumer-service-migrations' });
  const database = openDatabase(logger);
  try {
    const migrator = new Migrator({ db: database, provider: new ConsumerMigrations() });
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
