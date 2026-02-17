import type { ColumnType } from 'kysely';

export interface SagaInstancesTable {
  id: string;
  sagaType: string;
  status: string;
  currentStep: number;
  isCompensating: boolean;
  data: ColumnType<unknown, string, string>;
  awaitedMessageId: string | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
