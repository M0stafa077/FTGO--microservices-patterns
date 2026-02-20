import type { ColumnType } from 'kysely';

export interface AccountEventsTable {
  accountId: string;
  version: number;
  type: string;
  payload: ColumnType<unknown, string, never>;
  occurredAt: Date;
}
