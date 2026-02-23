export interface OrderHistoryTable {
  orderId: string;
  consumerId: string;
  state: string;
  createdAt: Date;
  keywords: string[];
  document: unknown;
  updatedAt: Date;
  version: number;
}
