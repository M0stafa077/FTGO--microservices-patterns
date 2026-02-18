export interface TicketsTable {
  id: string;
  restaurantId: string;
  state: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
