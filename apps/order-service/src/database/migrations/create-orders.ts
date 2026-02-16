import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

export class CreateOrders implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('orders')
      .addColumn('id', 'uuid', (column) => column.primaryKey())
      .addColumn('consumer_id', 'uuid', (column) => column.notNull())
      .addColumn('restaurant_id', 'uuid', (column) => column.notNull())
      .addColumn('restaurant_name', 'text', (column) => column.notNull())
      .addColumn('state', 'text', (column) => column.notNull())
      .addColumn('delivery_street1', 'text', (column) => column.notNull())
      .addColumn('delivery_street2', 'text')
      .addColumn('delivery_city', 'text', (column) => column.notNull())
      .addColumn('delivery_state', 'text', (column) => column.notNull())
      .addColumn('delivery_zip', 'text', (column) => column.notNull())
      .addColumn('delivery_time', 'timestamptz', (column) => column.notNull())
      .addColumn('created_at', 'timestamptz', (column) => column.notNull())
      .addColumn('updated_at', 'timestamptz', (column) => column.notNull())
      .addColumn('version', 'integer', (column) => column.notNull().defaultTo(0))
      .addCheckConstraint('orders_state_check', sql`state in ('APPROVAL_PENDING')`)
      .execute();
    await database.schema
      .createIndex('orders_consumer_id_idx')
      .on('orders')
      .column('consumer_id')
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('orders').execute();
  }
}
