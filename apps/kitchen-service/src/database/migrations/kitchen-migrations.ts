import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { CreateOutboxMessages, CreateProcessedMessages } from '@ftgo/messaging/infrastructure';
import type { Migration, MigrationProvider } from 'kysely/migration';

import { AcceptTickets } from './accept-tickets.js';
import { AllowCancelAndRevisionStates } from './allow-cancel-and-revision-states.js';
import { CreateRestaurantMenuItems } from './create-restaurant-menu-items.js';
import { CreateRestaurants } from './create-restaurants.js';
import { CreateTicketLineItems } from './create-ticket-line-items.js';
import { CreateTickets } from './create-tickets.js';
import { RecordTicketConsumers } from './record-ticket-consumers.js';

export class KitchenMigrations implements MigrationProvider {
  private readonly migrations: ReadonlyMap<string, SchemaMigration> = new Map([
    ['0001_create_restaurants', new CreateRestaurants()],
    ['0002_create_restaurant_menu_items', new CreateRestaurantMenuItems()],
    ['0003_create_tickets', new CreateTickets()],
    ['0004_create_ticket_line_items', new CreateTicketLineItems()],
    ['0005_create_outbox_messages', new CreateOutboxMessages()],
    ['0006_create_processed_messages', new CreateProcessedMessages()],
    ['0007_allow_cancel_and_revision_states', new AllowCancelAndRevisionStates()],
    ['0008_accept_tickets', new AcceptTickets()],
    ['0009_record_ticket_consumers', new RecordTicketConsumers()],
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
