import type { Money } from '@ftgo/common';

import type { OrderEventTranslation } from './order-event-translation.js';
import type { OrderEvent } from './order-event.js';
import type { Order } from './order.entity.js';
import type { RequestedLineItem } from './requested-line-item.js';

export class OrderRevisionProposed implements OrderEvent {
  public constructor(
    public readonly order: Order,
    public readonly revisions: ReadonlyArray<RequestedLineItem>,
    public readonly revisedTotal: Money,
  ) {}

  public translate<T>(translation: OrderEventTranslation<T>): T {
    return translation.orderRevisionProposed(this);
  }
}
