import type { SchemaMigration } from '@ftgo/common/infrastructure';
import type { Kysely } from 'kysely';

export class CreateRestaurantMenuItems implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('restaurant_menu_items')
      .addColumn('restaurant_id', 'uuid', (column) =>
        column.notNull().references('restaurants.id').onDelete('cascade'),
      )
      .addColumn('id', 'text', (column) => column.notNull())
      .addPrimaryKeyConstraint('restaurant_menu_items_pkey', ['restaurant_id', 'id'])
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('restaurant_menu_items').execute();
  }
}
