import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

export class AddConsumerRole implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .alterTable('consumers')
      .addColumn('role', 'text', (column) => column.notNull().defaultTo('CONSUMER'))
      .execute();
    await database.schema
      .alterTable('consumers')
      .addCheckConstraint('consumers_role_check', sql`role in ('CONSUMER', 'ADMIN')`)
      .execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.alterTable('consumers').dropColumn('role').execute();
  }
}
