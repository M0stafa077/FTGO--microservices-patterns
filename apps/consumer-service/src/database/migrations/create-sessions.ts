import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

export class CreateSessions implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('sessions')
      .addColumn('id', 'uuid', (column) => column.primaryKey())
      .addColumn('consumer_id', 'uuid', (column) =>
        column.notNull().references('consumers.id').onDelete('cascade'),
      )
      .addColumn('refresh_token_hash', 'text', (column) => column.notNull())
      .addColumn('started_at', 'timestamptz', (column) => column.notNull())
      .addColumn('expires_at', 'timestamptz', (column) => column.notNull())
      .addColumn('last_refreshed_at', 'timestamptz', (column) => column.notNull())
      .addColumn('revoked_at', 'timestamptz')
      .addColumn('revocation_reason', 'text')
      .addColumn('version', 'integer', (column) => column.notNull().defaultTo(0))
      .addCheckConstraint(
        'sessions_revocation_check',
        sql`(revoked_at is null) = (revocation_reason is null)`,
      )
      .execute();
    await database.schema
      .createIndex('sessions_consumer_id_idx')
      .on('sessions')
      .column('consumer_id')
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('sessions').execute();
  }
}
