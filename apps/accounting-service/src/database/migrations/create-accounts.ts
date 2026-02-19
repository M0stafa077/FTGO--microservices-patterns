import type { SchemaMigration } from '@ftgo/common/infrastructure';
import type { Kysely } from 'kysely';

export class CreateAccounts implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('accounts')
      .addColumn('id', 'uuid', (column) => column.primaryKey())
      .addColumn('opened_at', 'timestamptz', (column) => column.notNull())
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('accounts').execute();
  }
}
