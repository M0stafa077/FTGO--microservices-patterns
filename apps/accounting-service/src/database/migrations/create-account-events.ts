import type { SchemaMigration } from '@ftgo/common/infrastructure';
import { sql, type Kysely } from 'kysely';

import { CreateAccounts } from './create-accounts.js';
import { CreateAuthorizations } from './create-authorizations.js';

export class CreateAccountEvents implements SchemaMigration {
  public async up(database: Kysely<unknown>): Promise<void> {
    await database.schema
      .createTable('account_events')
      .addColumn('account_id', 'uuid', (column) => column.notNull())
      .addColumn('version', 'integer', (column) => column.notNull())
      .addColumn('type', 'varchar(100)', (column) => column.notNull())
      .addColumn('payload', 'jsonb', (column) => column.notNull())
      .addColumn('occurred_at', 'timestamptz', (column) => column.notNull())
      .addPrimaryKeyConstraint('account_events_pkey', ['account_id', 'version'])
      .addCheckConstraint('account_events_version_check', sql`version >= 1`)
      .execute();
    await this.copyAccounts(database);
    await this.copyAuthorizations(database);
    await database.schema.dropTable('authorizations').execute();
    await database.schema.dropTable('accounts').execute();
  }

  public async down(database: Kysely<unknown>): Promise<void> {
    await new CreateAccounts().up(database);
    await new CreateAuthorizations().up(database);
    await sql`
      insert into accounts (id, opened_at)
      select account_id, occurred_at from account_events where type = 'AccountCreated'
    `.execute(database);
    await sql`
      insert into authorizations (order_id, account_id, amount, currency, authorized_at)
      select (payload ->> 'orderId')::uuid,
             account_id,
             (payload -> 'orderTotal' ->> 'amount')::bigint,
             payload -> 'orderTotal' ->> 'currency',
             occurred_at
      from account_events
      where type = 'AccountAuthorized'
    `.execute(database);
    await database.schema.dropTable('account_events').execute();
  }

  private async copyAccounts(database: Kysely<unknown>): Promise<void> {
    await sql`
      insert into account_events (account_id, version, type, payload, occurred_at)
      select id, 1, 'AccountCreated', '{}'::jsonb, opened_at from accounts
    `.execute(database);
  }

  private async copyAuthorizations(database: Kysely<unknown>): Promise<void> {
    await sql`
      insert into account_events (account_id, version, type, payload, occurred_at)
      select account_id,
             1 + row_number() over (partition by account_id order by authorized_at, order_id),
             'AccountAuthorized',
             jsonb_build_object(
               'orderId', order_id,
               'orderTotal', jsonb_build_object('amount', amount, 'currency', currency)
             ),
             authorized_at
      from authorizations
    `.execute(database);
  }
}
