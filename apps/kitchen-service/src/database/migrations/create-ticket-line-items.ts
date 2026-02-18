import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

export class CreateTicketLineItems implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('ticket_line_items')
      .addColumn('ticket_id', 'uuid', (column) =>
        column.notNull().references('tickets.id').onDelete('cascade'),
      )
      .addColumn('menu_item_id', 'text', (column) => column.notNull())
      .addColumn('position', 'integer', (column) => column.notNull())
      .addColumn('name', 'text', (column) => column.notNull())
      .addColumn('quantity', 'integer', (column) => column.notNull())
      .addPrimaryKeyConstraint('ticket_line_items_pkey', ['ticket_id', 'menu_item_id'])
      .addUniqueConstraint('ticket_line_items_position_key', ['ticket_id', 'position'])
      .addCheckConstraint('ticket_line_items_quantity_check', sql`quantity between 1 and 100`)
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('ticket_line_items').execute();
  }
}
