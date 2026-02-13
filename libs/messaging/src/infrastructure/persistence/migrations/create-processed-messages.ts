import type { SchemaMigration } from '@ftgo/common/infrastructure';
import type { Kysely } from 'kysely';

export class CreateProcessedMessages implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('processed_messages')
      .addColumn('consumer_group', 'text', (column) => column.notNull())
      .addColumn('message_id', 'uuid', (column) => column.notNull())
      .addColumn('processed_at', 'timestamptz', (column) => column.notNull())
      .addPrimaryKeyConstraint('processed_messages_pkey', ['consumer_group', 'message_id'])
      .execute();
    await database.schema
      .createIndex('processed_messages_processed_at_idx')
      .on('processed_messages')
      .column('processed_at')
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('processed_messages').execute();
  }
}
