export interface OrdersTable {
  id: string;
  consumerId: string;
  restaurantId: string;
  restaurantName: string;
  state: string;
  deliveryStreet1: string;
  deliveryStreet2: string | null;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  deliveryTime: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
