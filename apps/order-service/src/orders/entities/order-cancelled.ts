import type { OrderEventTranslation } from './order-event-translation.js';
import type { OrderEvent } from './order-event.js';
import type { OrderId } from './order-id.js';

export class OrderCancelled implements OrderEvent {
  public constructor(public readonly orderId: OrderId) {}

  public translate<T>(translation: OrderEventTranslation<T>): T {
    return translation.orderCancelled(this);
  }
}
