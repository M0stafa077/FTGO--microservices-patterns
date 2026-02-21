import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { CreateOutboxMessages, CreateProcessedMessages } from '@ftgo/messaging/infrastructure';
import type { Migration, MigrationProvider } from 'kysely/migration';

import { CreateCouriers } from './create-couriers.js';
import { CreateDeliveries } from './create-deliveries.js';
import { CreateRestaurants } from './create-restaurants.js';

export class DeliveryMigrations implements MigrationProvider {
  private readonly migrations: ReadonlyMap<string, SchemaMigration> = new Map([
    ['0001_create_restaurants', new CreateRestaurants()],
    ['0002_create_couriers', new CreateCouriers()],
    ['0003_create_deliveries', new CreateDeliveries()],
    ['0004_create_outbox_messages', new CreateOutboxMessages()],
    ['0005_create_processed_messages', new CreateProcessedMessages()],
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
