import { Clock } from '@ftgo/common';
import { Outbox } from '@ftgo/messaging';
import { Inject, Injectable } from '@nestjs/common';

import type { OrderId } from './entities/order-id.js';
import type { Order } from './entities/order.entity.js';
import type { RequestedLineItem } from './entities/requested-line-item.js';
import { OrderEventMessages } from './order-event-messages.js';
import { Orders } from './orders.js';

@Injectable()
export class OrderTransitions {
  public constructor(
    @Inject(Orders) private readonly orders: Orders,
    @Inject(Outbox) private readonly outbox: Outbox,
    @Inject(Clock) private readonly clock: Clock,
    private readonly messages: OrderEventMessages,
  ) {}

  public async approve(id: OrderId): Promise<void> {
    await this.change(id, (order, now) => {
      order.approve(now);
    });
  }

  public async reject(id: OrderId): Promise<void> {
    await this.change(id, (order, now) => {
      order.reject(now);
    });
  }

  public async undoCancel(id: OrderId): Promise<void> {
    await this.change(id, (order, now) => {
      order.undoCancel(now);
    });
  }

  public async confirmCancel(id: OrderId): Promise<void> {
    await this.change(id, (order, now) => {
      order.confirmCancel(now);
    });
  }

  public async undoRevision(id: OrderId): Promise<void> {
    await this.change(id, (order, now) => {
      order.undoRevision(now);
    });
  }

  public async confirmRevision(
    id: OrderId,
    revisions: ReadonlyArray<RequestedLineItem>,
  ): Promise<void> {
    await this.change(id, (order, now) => {
      order.confirmRevision(revisions, now);
    });
  }

  private async change(id: OrderId, operation: (order: Order, now: Date) => void): Promise<void> {
    const order = await this.orders.getById(id);
    operation(order, this.clock.now());
    await this.orders.update(order);
    for (const message of this.messages.releasedFrom(order)) {
      await this.outbox.append(message);
    }
  }
}
