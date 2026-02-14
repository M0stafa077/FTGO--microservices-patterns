import { Role } from '@ftgo/common';
import { Environment, PostgresTransactions, SystemClock } from '@ftgo/common/infrastructure';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { pino, type Logger } from 'pino';

import { DatabaseConfig } from './config/database.config.js';
import { EmailAddress } from './consumers/entities/email-address.js';
import { PostgresConsumers } from './consumers/postgres-consumers.js';
import type { ConsumerTables } from './database/consumer-tables.js';

function openDatabase(logger: Logger): PostgresTransactions<ConsumerTables> {
  const config = DatabaseConfig.fromEnvironment(new Environment(process.env));
  return new PostgresTransactions(
    new Kysely<ConsumerTables>({
      dialect: new PostgresDialect({
        pool: config.createPool('consumer-service-grant-admin', (error) => {
          logger.warn({ err: error }, 'idle database connection failed');
        }),
      }),
      plugins: [new CamelCasePlugin({ maintainNestedObjectKeys: true })],
    }),
  );
}

async function grantAdmin(email: string): Promise<void> {
  const logger = pino({ name: 'consumer-service-grant-admin' });
  const database = openDatabase(logger);
  try {
    const consumers = new PostgresConsumers(database);
    const consumer = await consumers.findByEmail(EmailAddress.of(email));
    if (consumer === undefined) {
      logger.error('no consumer has this email address');
      process.exitCode = 1;
      return;
    }
    consumer.grantRole(Role.Admin, new SystemClock().now());
    await consumers.update(consumer);
    logger.info({ consumerId: consumer.id.toString() }, 'admin role granted');
  } catch (error) {
    logger.error({ err: error }, 'admin role not granted');
    process.exitCode = 1;
  } finally {
    await database.close();
  }
}

void grantAdmin(process.argv[2] ?? '');
