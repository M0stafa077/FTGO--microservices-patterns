import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

export class CreateOutboxMessages implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('outbox_messages')
      .addColumn('id', 'uuid', (column) => column.primaryKey())
      .addColumn('sequence', 'bigint', (column) => column.notNull().generatedAlwaysAsIdentity())
      .addColumn('topic', 'text', (column) => column.notNull())
      .addColumn('partition_key', 'text', (column) => column.notNull())
      .addColumn('type', 'text', (column) => column.notNull())
      .addColumn('headers', 'jsonb', (column) => column.notNull())
      .addColumn('payload', 'jsonb', (column) => column.notNull())
      .addColumn('created_at', 'timestamptz', (column) => column.notNull())
      .addColumn('published_at', 'timestamptz')
      .execute();
    await this.createIndexes(database);
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('outbox_messages').execute();
  }

  private async createIndexes(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createIndex('outbox_messages_unpublished_idx')
      .on('outbox_messages')
      .column('sequence')
      .where(sql.ref('published_at'), 'is', null)
      .execute();
    await database.schema
      .createIndex('outbox_messages_published_at_idx')
      .on('outbox_messages')
      .column('published_at')
      .where(sql.ref('published_at'), 'is not', null)
      .execute();
  }
}
