export interface DeliveriesTable {
  id: string;
  consumerId: string;
  restaurantId: string;
  state: string;
  pickupStreet1: string;
  pickupStreet2: string | null;
  pickupCity: string;
  pickupState: string;
  pickupZip: string;
  deliveryStreet1: string;
  deliveryStreet2: string | null;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  pickupTime: Date | null;
  deliveryTime: Date | null;
  courierId: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
