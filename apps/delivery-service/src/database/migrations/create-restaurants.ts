import type { SchemaMigration } from '@ftgo/common/infrastructure';
import type { Kysely } from 'kysely';

export class CreateRestaurants implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('restaurants')
      .addColumn('id', 'uuid', (column) => column.primaryKey())
      .addColumn('street1', 'text', (column) => column.notNull())
      .addColumn('street2', 'text')
      .addColumn('city', 'text', (column) => column.notNull())
      .addColumn('state', 'text', (column) => column.notNull())
      .addColumn('zip', 'text', (column) => column.notNull())
      .addColumn('created_at', 'timestamptz', (column) => column.notNull())
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('restaurants').execute();
  }
}
