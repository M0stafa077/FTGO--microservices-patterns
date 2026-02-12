import type { Migration, MigrationProvider } from 'kysely/migration';

import { CreateConsumers } from './create-consumers.js';
import { CreateSessions } from './create-sessions.js';
import type { SchemaMigration } from './schema-migration.js';

export class ConsumerMigrations implements MigrationProvider {
  private readonly migrations: ReadonlyMap<string, SchemaMigration> = new Map([
    ['0001_create_consumers', new CreateConsumers()],
    ['0002_create_sessions', new CreateSessions()],
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
