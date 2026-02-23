import type { OrderApproved } from './order-approved.js';
import type { OrderCancellationRequested } from './order-cancellation-requested.js';
import type { OrderCancelled } from './order-cancelled.js';
import type { OrderPlaced } from './order-placed.js';
import type { OrderRejected } from './order-rejected.js';
import type { OrderRevised } from './order-revised.js';
import type { OrderRevisionProposed } from './order-revision-proposed.js';

export interface OrderEventTranslation<T> {
  orderPlaced(event: OrderPlaced): T;

  orderApproved(event: OrderApproved): T;

  orderRejected(event: OrderRejected): T;

  orderCancellationRequested(event: OrderCancellationRequested): T;

  orderCancelled(event: OrderCancelled): T;

  orderRevisionProposed(event: OrderRevisionProposed): T;

  orderRevised(event: OrderRevised): T;
}
