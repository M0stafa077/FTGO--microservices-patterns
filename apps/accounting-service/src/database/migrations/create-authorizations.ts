import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

export class CreateAuthorizations implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('authorizations')
      .addColumn('order_id', 'uuid', (column) => column.primaryKey())
      .addColumn('account_id', 'uuid', (column) => column.notNull().references('accounts.id'))
      .addColumn('amount', 'bigint', (column) => column.notNull())
      .addColumn('currency', 'char(3)', (column) => column.notNull())
      .addColumn('authorized_at', 'timestamptz', (column) => column.notNull())
      .addCheckConstraint('authorizations_amount_check', sql`amount >= 0`)
      .addCheckConstraint('authorizations_currency_check', sql`currency ~ '^[A-Z]{3}$'`)
      .execute();
    await database.schema
      .createIndex('authorizations_account_id_idx')
      .on('authorizations')
      .column('account_id')
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('authorizations').execute();
  }
}
