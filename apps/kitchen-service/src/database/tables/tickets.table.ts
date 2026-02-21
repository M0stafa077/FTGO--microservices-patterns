export interface TicketsTable {
  id: string;
  restaurantId: string;
  state: string;
  previousState: string | null;
  readyBy: Date | null;
  acceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
