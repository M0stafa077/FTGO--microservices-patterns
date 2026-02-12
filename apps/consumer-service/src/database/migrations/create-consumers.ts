import type { Kysely } from 'kysely';

import type { SchemaMigration } from './schema-migration.js';

export class CreateConsumers implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('consumers')
      .addColumn('id', 'uuid', (column) => column.primaryKey())
      .addColumn('email', 'text', (column) => column.notNull())
      .addColumn('password_hash', 'text', (column) => column.notNull())
      .addColumn('first_name', 'text', (column) => column.notNull())
      .addColumn('last_name', 'text', (column) => column.notNull())
      .addColumn('phone_number', 'text')
      .addColumn('registered_at', 'timestamptz', (column) => column.notNull())
      .addColumn('updated_at', 'timestamptz', (column) => column.notNull())
      .addColumn('version', 'integer', (column) => column.notNull().defaultTo(0))
      .addUniqueConstraint('consumers_email_key', ['email'])
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.dropTable('consumers').execute();
  }
}
