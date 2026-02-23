import type { Money } from '@ftgo/common';
import type { Money as MoneyPayload } from '@ftgo/contracts';
import { Sagas } from '@ftgo/saga';
import { Inject, Injectable } from '@nestjs/common';

import { OrderCancellation } from '../order-cancellation/order-cancellation.js';
import { OrderCreation } from '../order-creation/order-creation.js';
import { OrderRevision } from '../order-revision/order-revision.js';

import type { OrderCancellationRequested } from './entities/order-cancellation-requested.js';
import type { OrderEventTranslation } from './entities/order-event-translation.js';
import type { OrderPlaced } from './entities/order-placed.js';
import type { OrderRevisionProposed } from './entities/order-revision-proposed.js';

@Injectable()
export class OrderSagaStarts implements OrderEventTranslation<Promise<void>> {
  public constructor(
    @Inject(Sagas) private readonly sagas: Sagas,
    private readonly orderCreation: OrderCreation,
    private readonly orderCancellation: OrderCancellation,
    private readonly orderRevision: OrderRevision,
  ) {}

  public async orderPlaced(event: OrderPlaced): Promise<void> {
    const { order } = event;
    await this.sagas.start(this.orderCreation, {
      orderId: order.id.toString(),
      consumerId: order.consumerId.toString(),
      restaurantId: order.restaurantId.toString(),
      ticketDetails: {
        lineItems: order.lineItems.items.map((item) => ({
          menuItemId: item.menuItemId.toString(),
          name: item.name.toString(),
          quantity: item.quantity.value,
        })),
      },
      orderTotal: this.payloadOf(order.total()),
    });
  }

  public async orderCancellationRequested(event: OrderCancellationRequested): Promise<void> {
    const { order } = event;
    await this.sagas.start(this.orderCancellation, {
      orderId: order.id.toString(),
      consumerId: order.consumerId.toString(),
      orderTotal: this.payloadOf(order.total()),
    });
  }

  public async orderRevisionProposed(event: OrderRevisionProposed): Promise<void> {
    const { order, revisions, revisedTotal } = event;
    await this.sagas.start(this.orderRevision, {
      orderId: order.id.toString(),
      consumerId: order.consumerId.toString(),
      revisedLineItems: revisions.map((revision) => ({
        menuItemId: revision.menuItemId.toString(),
        quantity: revision.quantity.value,
      })),
      revisedOrderTotal: this.payloadOf(revisedTotal),
    });
  }

  public async orderApproved(): Promise<void> {
    await Promise.resolve();
  }

  public async orderRejected(): Promise<void> {
    await Promise.resolve();
  }

  public async orderCancelled(): Promise<void> {
    await Promise.resolve();
  }

  public async orderRevised(): Promise<void> {
    await Promise.resolve();
  }

  private payloadOf(money: Money): MoneyPayload {
    return { amount: money.amount, currency: money.currency.toString() };
  }
}
