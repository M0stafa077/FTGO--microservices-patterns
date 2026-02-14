import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { CreateOutboxMessages, CreateProcessedMessages } from '@ftgo/messaging/infrastructure';
import type { Migration, MigrationProvider } from 'kysely/migration';

import { AddConsumerRole } from './add-consumer-role.js';
import { CreateConsumers } from './create-consumers.js';
import { CreateSessions } from './create-sessions.js';

export class ConsumerMigrations implements MigrationProvider {
  private readonly migrations: ReadonlyMap<string, SchemaMigration> = new Map([
    ['0001_create_consumers', new CreateConsumers()],
    ['0002_create_sessions', new CreateSessions()],
    ['0003_create_outbox_messages', new CreateOutboxMessages()],
    ['0004_create_processed_messages', new CreateProcessedMessages()],
    ['0005_add_consumer_role', new AddConsumerRole()],
  ]);

  public async getMigrations(): Promise<Record<string, Migration>> {
    return Object.fromEntries(
      [...this.migrations].map(([name, migration]) => [name, this.toKysely(migration)]),
    );
  }

  private toKysely(migration: SchemaMigration): Migration {
    return {
      up: async (database) => migration.up(database),
      down: async (database) => migration.down(database),
    };
  }
}
