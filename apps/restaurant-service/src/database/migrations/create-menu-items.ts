import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

export class CreateMenuItems implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('menu_items')
      .addColumn('restaurant_id', 'uuid', (column) =>
        column.notNull().references('restaurants.id').onDelete('cascade'),
      )
      .addColumn('id', 'text', (column) => column.notNull())
      .addColumn('position', 'integer', (column) => column.notNull())
      .addColumn('name', 'text', (column) => column.notNull())
      .addColumn('price_amount', 'integer', (column) => column.notNull())
      .addColumn('price_currency', 'char(3)', (column) => column.notNull())
      .addPrimaryKeyConstraint('menu_items_pkey', ['restaurant_id', 'id'])
      .addUniqueConstraint('menu_items_position_key', ['restaurant_id', 'position'])
      .addCheckConstraint('menu_items_price_check', sql`price_amount > 0`)
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('menu_items').execute();
  }
}
