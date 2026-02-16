export interface OrderLineItemsTable {
  orderId: string;
  menuItemId: string;
  position: number;
  name: string;
  priceAmount: number;
  priceCurrency: string;
  quantity: number;
}
