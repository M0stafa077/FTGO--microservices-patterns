import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

export class AllowCancelAndRevisionStates implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await this.replaceStateCheck(
      database,
      sql`state in ('CREATE_PENDING', 'AWAITING_ACCEPTANCE', 'CANCEL_PENDING', 'REVISION_PENDING', 'CANCELLED')`,
    );
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await this.replaceStateCheck(
      database,
      sql`state in ('CREATE_PENDING', 'AWAITING_ACCEPTANCE', 'CANCELLED')`,
    );
  }

  private async replaceStateCheck(
    database: Kysely<unknown>,
    check: ReturnType<typeof sql>,
  ): Promise<void> {
    await database.schema.alterTable('tickets').dropConstraint('tickets_state_check').execute();
    await database.schema
      .alterTable('tickets')
      .addCheckConstraint('tickets_state_check', check)
      .execute();
  }
}
