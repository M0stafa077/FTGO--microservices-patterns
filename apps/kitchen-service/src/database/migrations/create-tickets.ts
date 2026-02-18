import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

export class CreateTickets implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('tickets')
      .addColumn('id', 'uuid', (column) => column.primaryKey())
      .addColumn('restaurant_id', 'uuid', (column) => column.notNull())
      .addColumn('state', 'text', (column) => column.notNull())
      .addColumn('created_at', 'timestamptz', (column) => column.notNull())
      .addColumn('updated_at', 'timestamptz', (column) => column.notNull())
      .addColumn('version', 'integer', (column) => column.notNull().defaultTo(0))
      .addCheckConstraint(
        'tickets_state_check',
        sql`state in ('CREATE_PENDING', 'AWAITING_ACCEPTANCE', 'CANCELLED')`,
      )
      .execute();
    await database.schema
      .createIndex('tickets_restaurant_id_idx')
      .on('tickets')
      .column('restaurant_id')
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('tickets').execute();
  }
}
