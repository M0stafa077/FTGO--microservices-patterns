import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { CreateOutboxMessages, CreateProcessedMessages } from '@ftgo/messaging/infrastructure';
import { CreateSagaInstances } from '@ftgo/saga/infrastructure';
import type { Migration, MigrationProvider } from 'kysely/migration';

import { AllowDecidedOrderStates } from './allow-decided-order-states.js';
import { CreateOrderLineItems } from './create-order-line-items.js';
import { CreateOrders } from './create-orders.js';
import { CreateRestaurantMenuItems } from './create-restaurant-menu-items.js';
import { CreateRestaurants } from './create-restaurants.js';

export class OrderMigrations implements MigrationProvider {
  private readonly migrations: ReadonlyMap<string, SchemaMigration> = new Map([
    ['0001_create_restaurants', new CreateRestaurants()],
    ['0002_create_restaurant_menu_items', new CreateRestaurantMenuItems()],
    ['0003_create_orders', new CreateOrders()],
    ['0004_create_order_line_items', new CreateOrderLineItems()],
    ['0005_create_outbox_messages', new CreateOutboxMessages()],
    ['0006_create_processed_messages', new CreateProcessedMessages()],
    ['0007_allow_decided_order_states', new AllowDecidedOrderStates()],
    ['0008_create_saga_instances', new CreateSagaInstances()],
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
