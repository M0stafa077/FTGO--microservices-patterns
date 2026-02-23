import { Environment } from '@ftgo/common/infrastructure';
import { KafkaConsumerGroups, MessagingConfig } from '@ftgo/messaging/infrastructure';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { pino, type Logger } from 'pino';

import { SERVICE_NAME } from './app.constants.js';
import { DatabaseConfig } from './config/database.config.js';

function openDatabase(environment: Environment, logger: Logger): Kysely<unknown> {
  const config = DatabaseConfig.fromEnvironment(environment);
  return new Kysely<unknown>({
    dialect: new PostgresDialect({
      pool: config.createPool('order-history-service-rebuild', (error) => {
        logger.warn({ err: error }, 'idle database connection failed');
      }),
    }),
  });
}

async function emptyView(environment: Environment, logger: Logger): Promise<void> {
  const database = openDatabase(environment, logger);
  try {
    await database.transaction().execute(async (transaction) => {
      await sql`truncate order_history, processed_messages`.execute(transaction);
    });
  } finally {
    await database.destroy();
  }
}

async function rebuild(): Promise<void> {
  const logger = pino({ name: 'order-history-service-rebuild' });
  const environment = new Environment(process.env);
  try {
    const { kafka } = MessagingConfig.fromEnvironment(environment);
    await new KafkaConsumerGroups(kafka).remove(SERVICE_NAME);
    await emptyView(environment, logger);
    logger.info(
      { consumerGroup: SERVICE_NAME },
      'view emptied; the service reads order.events from offset zero on its next start',
    );
  } catch (error) {
    logger.error({ err: error }, 'rebuild failed');
    process.exitCode = 1;
  }
}

void rebuild();
