import type { SchemaMigration } from '@ftgo/common/infrastructure';
import type { Kysely } from 'kysely';

export class RecordTicketConsumers implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema.alterTable('tickets').addColumn('consumer_id', 'uuid').execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await database.schema.alterTable('tickets').dropColumn('consumer_id').execute();
  }
}
