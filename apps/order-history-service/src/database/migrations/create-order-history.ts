import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

export class CreateOrderHistory implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('order_history')
      .addColumn('order_id', 'uuid', (column) => column.primaryKey())
      .addColumn('consumer_id', 'uuid', (column) => column.notNull())
      .addColumn('state', 'text', (column) => column.notNull())
      .addColumn('created_at', 'timestamptz', (column) => column.notNull())
      .addColumn('keywords', sql`text[]`, (column) => column.notNull())
      .addColumn('document', 'jsonb', (column) => column.notNull())
      .addColumn('updated_at', 'timestamptz', (column) => column.notNull())
      .addColumn('version', 'integer', (column) => column.notNull().defaultTo(0))
      .addCheckConstraint(
        'order_history_state_check',
        sql`state in ('APPROVAL_PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')`,
      )
      .execute();
    await this.addIndexes(database);
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('order_history').execute();
  }

  private async addIndexes(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createIndex('order_history_consumer_created_idx')
      .on('order_history')
      .columns(['consumer_id', 'created_at', 'order_id'])
      .execute();
    await database.schema
      .createIndex('order_history_keywords_idx')
      .on('order_history')
      .using('gin')
      .column('keywords')
      .execute();
  }
}
