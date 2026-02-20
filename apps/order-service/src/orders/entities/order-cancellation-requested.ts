import type { OrderEventTranslation } from './order-event-translation.js';
import type { OrderEvent } from './order-event.js';
import type { Order } from './order.entity.js';

export class OrderCancellationRequested implements OrderEvent {
  public constructor(public readonly order: Order) {}

  public translate<T>(translation: OrderEventTranslation<T>): T {
    return translation.orderCancellationRequested(this);
  }
}
