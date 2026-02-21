import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

export class AcceptTickets implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .alterTable('tickets')
      .addColumn('previous_state', 'text')
      .addColumn('ready_by', 'timestamptz')
      .addColumn('accepted_at', 'timestamptz')
      .execute();
    await sql`
      update tickets set previous_state = 'AWAITING_ACCEPTANCE'
      where state in ('CANCEL_PENDING', 'REVISION_PENDING')
    `.execute(database);
    await this.replaceStateCheck(
      database,
      sql`state in ('CREATE_PENDING', 'AWAITING_ACCEPTANCE', 'ACCEPTED', 'CANCEL_PENDING', 'REVISION_PENDING', 'CANCELLED')`,
    );
    await this.addChecks(database);
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await sql`update tickets set state = 'AWAITING_ACCEPTANCE' where state = 'ACCEPTED'`.execute(
      database,
    );
    await database.schema
      .alterTable('tickets')
      .dropConstraint('tickets_acceptance_check')
      .execute();
    await database.schema
      .alterTable('tickets')
      .dropConstraint('tickets_previous_state_check')
      .execute();
    await database.schema
      .alterTable('tickets')
      .dropColumn('accepted_at')
      .dropColumn('ready_by')
      .dropColumn('previous_state')
      .execute();
    await this.replaceStateCheck(
      database,
      sql`state in ('CREATE_PENDING', 'AWAITING_ACCEPTANCE', 'CANCEL_PENDING', 'REVISION_PENDING', 'CANCELLED')`,
    );
  }

  private async addChecks(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .alterTable('tickets')
      .addCheckConstraint(
        'tickets_previous_state_check',
        sql`(state in ('CANCEL_PENDING', 'REVISION_PENDING')) = (previous_state is not null)
          and (previous_state is null or previous_state in ('AWAITING_ACCEPTANCE', 'ACCEPTED'))`,
      )
      .execute();
    await database.schema
      .alterTable('tickets')
      .addCheckConstraint(
        'tickets_acceptance_check',
        sql`(ready_by is null) = (accepted_at is null)`,
      )
      .execute();
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
