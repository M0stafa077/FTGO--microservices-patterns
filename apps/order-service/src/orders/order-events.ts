import { Outbox } from '@ftgo/messaging';
import { Inject, Injectable } from '@nestjs/common';

import type { Order } from './entities/order.entity.js';
import { OrderEventMessages } from './order-event-messages.js';
import { OrderSagaStarts } from './order-saga-starts.js';

@Injectable()
export class OrderEvents {
  public constructor(
    @Inject(Outbox) private readonly outbox: Outbox,
    private readonly messages: OrderEventMessages,
    private readonly sagaStarts: OrderSagaStarts,
  ) {}

  public async appendEventsOf(order: Order): Promise<void> {
    for (const event of order.releaseEvents()) {
      for (const message of this.messages.of(event)) {
        await this.outbox.append(message);
      }
      await event.translate(this.sagaStarts);
    }
  }
}
