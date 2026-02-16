import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

export class CreateOrderLineItems implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('order_line_items')
      .addColumn('order_id', 'uuid', (column) =>
        column.notNull().references('orders.id').onDelete('cascade'),
      )
      .addColumn('menu_item_id', 'text', (column) => column.notNull())
      .addColumn('position', 'integer', (column) => column.notNull())
      .addColumn('name', 'text', (column) => column.notNull())
      .addColumn('price_amount', 'integer', (column) => column.notNull())
      .addColumn('price_currency', 'char(3)', (column) => column.notNull())
      .addColumn('quantity', 'integer', (column) => column.notNull())
      .addPrimaryKeyConstraint('order_line_items_pkey', ['order_id', 'menu_item_id'])
      .addUniqueConstraint('order_line_items_position_key', ['order_id', 'position'])
      .addCheckConstraint('order_line_items_price_check', sql`price_amount > 0`)
      .addCheckConstraint('order_line_items_quantity_check', sql`quantity between 1 and 100`)
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('order_line_items').execute();
  }
}
