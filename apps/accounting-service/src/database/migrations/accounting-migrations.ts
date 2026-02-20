import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { CreateOutboxMessages, CreateProcessedMessages } from '@ftgo/messaging/infrastructure';
import type { Migration, MigrationProvider } from 'kysely/migration';

import { CreateAccountEvents } from './create-account-events.js';
import { CreateAccounts } from './create-accounts.js';
import { CreateAuthorizations } from './create-authorizations.js';

export class AccountingMigrations implements MigrationProvider {
  private readonly migrations: ReadonlyMap<string, SchemaMigration> = new Map([
    ['0001_create_accounts', new CreateAccounts()],
    ['0002_create_authorizations', new CreateAuthorizations()],
    ['0003_create_outbox_messages', new CreateOutboxMessages()],
    ['0004_create_processed_messages', new CreateProcessedMessages()],
    ['0005_create_account_events', new CreateAccountEvents()],
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
