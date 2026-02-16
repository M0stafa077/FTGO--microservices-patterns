import { OrderCreated } from '@ftgo/contracts';
import { OutgoingMessage } from '@ftgo/messaging';
import { Injectable } from '@nestjs/common';

import type { OrderEventTranslation } from './entities/order-event-translation.js';
import type { OrderEvent } from './entities/order-event.js';
import type { OrderPlaced } from './entities/order-placed.js';
import { PublishedOrder } from './published-order.js';

@Injectable()
export class OrderEventMessages implements OrderEventTranslation<OutgoingMessage> {
  public of(event: OrderEvent): OutgoingMessage {
    return event.translate(this);
  }

  public orderPlaced(event: OrderPlaced): OutgoingMessage {
    const { order } = event;
    const orderId = order.id.toString();
    const published = new PublishedOrder(order);
    return OutgoingMessage.event(OrderCreated, orderId, {
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
  }
}
