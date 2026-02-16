import type { OrderPlaced } from './order-placed.js';

export interface OrderEventTranslation<T> {
  orderPlaced(event: OrderPlaced): T;
}
