import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

export class AllowCancelAndRevisionStates implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await this.replaceStateCheck(
      database,
      sql`state in ('APPROVAL_PENDING', 'APPROVED', 'REJECTED', 'CANCEL_PENDING', 'CANCELLED', 'REVISION_PENDING')`,
    );
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await this.replaceStateCheck(
      database,
      sql`state in ('APPROVAL_PENDING', 'APPROVED', 'REJECTED')`,
    );
  }

  private async replaceStateCheck(
    database: Kysely<unknown>,
    check: ReturnType<typeof sql>,
  ): Promise<void> {
    await database.schema.alterTable('orders').dropConstraint('orders_state_check').execute();
    await database.schema
      .alterTable('orders')
      .addCheckConstraint('orders_state_check', check)
      .execute();
  }
}
