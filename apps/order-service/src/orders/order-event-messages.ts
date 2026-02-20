import { OrderAuthorized, OrderCancelled, OrderCreated, OrderRejected } from '@ftgo/contracts';
import { OutgoingMessage } from '@ftgo/messaging';
import { Injectable } from '@nestjs/common';

import type { OrderApproved } from './entities/order-approved.js';
import type { OrderCancelled as OrderCancelledEvent } from './entities/order-cancelled.js';
import type { OrderEventTranslation } from './entities/order-event-translation.js';
import type { OrderEvent } from './entities/order-event.js';
import type { OrderPlaced } from './entities/order-placed.js';
import type { OrderRejected as OrderRejectedEvent } from './entities/order-rejected.js';
import type { Order } from './entities/order.entity.js';
import { PublishedOrder } from './published-order.js';

@Injectable()
export class OrderEventMessages implements OrderEventTranslation<ReadonlyArray<OutgoingMessage>> {
  public of(event: OrderEvent): ReadonlyArray<OutgoingMessage> {
    return event.translate(this);
  }

  public releasedFrom(order: Order): ReadonlyArray<OutgoingMessage> {
    return order.releaseEvents().flatMap((event) => this.of(event));
  }

  public orderPlaced(event: OrderPlaced): ReadonlyArray<OutgoingMessage> {
    const { order } = event;
    const orderId = order.id.toString();
    const published = new PublishedOrder(order);
    const message = OutgoingMessage.event(OrderCreated, orderId, {
      orderId,
      orderDetails: {
        consumerId: order.consumerId.toString(),
        restaurantId: order.restaurantId.toString(),
        lineItems: published.lineItems(),
        orderTotal: published.total(),
      },
      deliveryAddress: published.deliveryAddress(),
      restaurantName: order.restaurantName.toString(),
    });
    return [message];
  }

  public orderApproved(event: OrderApproved): ReadonlyArray<OutgoingMessage> {
    const orderId = event.orderId.toString();
    return [OutgoingMessage.event(OrderAuthorized, orderId, { orderId })];
  }

  public orderRejected(event: OrderRejectedEvent): ReadonlyArray<OutgoingMessage> {
    const orderId = event.orderId.toString();
    return [OutgoingMessage.event(OrderRejected, orderId, { orderId })];
  }

  public orderCancellationRequested(): ReadonlyArray<OutgoingMessage> {
    return [];
  }

  public orderCancelled(event: OrderCancelledEvent): ReadonlyArray<OutgoingMessage> {
    const orderId = event.orderId.toString();
    return [OutgoingMessage.event(OrderCancelled, orderId, { orderId })];
  }

  public orderRevisionProposed(): ReadonlyArray<OutgoingMessage> {
    return [];
  }
}
