import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

export class CreateSagaInstances implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('saga_instances')
      .addColumn('id', 'uuid', (column) => column.primaryKey())
      .addColumn('saga_type', 'text', (column) => column.notNull())
      .addColumn('status', 'text', (column) => column.notNull())
      .addColumn('current_step', 'integer', (column) => column.notNull())
      .addColumn('is_compensating', 'boolean', (column) => column.notNull())
      .addColumn('data', 'jsonb', (column) => column.notNull())
      .addColumn('awaited_message_id', 'uuid')
      .addColumn('failure_reason', 'text')
      .addColumn('created_at', 'timestamptz', (column) => column.notNull())
      .addColumn('updated_at', 'timestamptz', (column) => column.notNull())
      .addColumn('version', 'integer', (column) => column.notNull())
      .addCheckConstraint(
        'saga_instances_status_check',
        sql`status in ('RUNNING', 'COMPLETED', 'COMPENSATED', 'FAILED')`,
      )
      .execute();
    await database.schema
      .createIndex('saga_instances_status_idx')
      .on('saga_instances')
      .columns(['status', 'updated_at'])
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('saga_instances').execute();
  }
}
