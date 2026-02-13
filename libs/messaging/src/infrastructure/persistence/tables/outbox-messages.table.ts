import type { ColumnType } from 'kysely';

export interface OutboxMessagesTable {
  id: string;
  sequence: ColumnType<string, never, never>;
  topic: string;
  partitionKey: string;
  type: string;
  headers: ColumnType<unknown, string, never>;
  payload: ColumnType<unknown, string, never>;
  createdAt: ColumnType<Date, Date, never>;
  publishedAt: Date | null;
}
