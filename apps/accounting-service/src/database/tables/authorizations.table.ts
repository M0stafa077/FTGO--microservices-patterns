import type { ColumnType } from 'kysely';

export interface AuthorizationsTable {
  orderId: string;
  accountId: string;
  amount: ColumnType<string, number, never>;
  currency: string;
  authorizedAt: Date;
}
