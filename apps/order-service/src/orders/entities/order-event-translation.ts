import type { OrderApproved } from './order-approved.js';
import type { OrderPlaced } from './order-placed.js';
import type { OrderRejected } from './order-rejected.js';

export interface OrderEventTranslation<T> {
  orderPlaced(event: OrderPlaced): T;

  orderApproved(event: OrderApproved): T;

  orderRejected(event: OrderRejected): T;
}
