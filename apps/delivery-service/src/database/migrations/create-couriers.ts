import type { SchemaMigration } from '@ftgo/common/infrastructure';
import type { Kysely } from 'kysely';

export class CreateCouriers implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('couriers')
      .addColumn('id', 'uuid', (column) => column.primaryKey())
      .addColumn('available', 'boolean', (column) => column.notNull())
      .addColumn('created_at', 'timestamptz', (column) => column.notNull())
      .addColumn('updated_at', 'timestamptz', (column) => column.notNull())
      .addColumn('version', 'integer', (column) => column.notNull().defaultTo(0))
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('couriers').execute();
  }
}
