import { Clock } from '@ftgo/common';
import { Outbox } from '@ftgo/messaging';
import { Inject, Injectable } from '@nestjs/common';

import type { OrderId } from './entities/order-id.js';
import type { Order } from './entities/order.entity.js';
import { OrderEventMessages } from './order-event-messages.js';
import { Orders } from './orders.js';

@Injectable()
export class OrderApproval {
  public constructor(
    @Inject(Orders) private readonly orders: Orders,
    @Inject(Outbox) private readonly outbox: Outbox,
    @Inject(Clock) private readonly clock: Clock,
    private readonly messages: OrderEventMessages,
  ) {}

  public async approve(id: OrderId): Promise<void> {
    const order = await this.orders.getById(id);
    order.approve(this.clock.now());
    await this.save(order);
  }

  public async reject(id: OrderId): Promise<void> {
    const order = await this.orders.getById(id);
    order.reject(this.clock.now());
    await this.save(order);
  }

  private async save(order: Order): Promise<void> {
    await this.orders.update(order);
    for (const message of this.messages.releasedFrom(order)) {
      await this.outbox.append(message);
    }
  }
}
