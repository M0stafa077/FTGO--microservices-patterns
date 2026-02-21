import { Address } from '@ftgo/common';
import {
  OrderCancelled,
  OrderCreated,
  OrderRejected,
  type OrderCancelledPayload,
  type OrderCreatedPayload,
  type OrderRejectedPayload,
} from '@ftgo/contracts';
import type { IncomingMessage } from '@ftgo/messaging';
import { MessageController, OnEvent } from '@ftgo/messaging/infrastructure';
import { Injectable } from '@nestjs/common';

import { RestaurantId } from '../restaurants/entities/restaurant-id.js';

import { DeliveriesService } from './deliveries.service.js';
import { ConsumerId } from './entities/consumer-id.js';
import { DeliveryId } from './entities/delivery-id.js';

@MessageController()
@Injectable()
export class OrderEventsController {
  public constructor(private readonly deliveriesService: DeliveriesService) {}

  @OnEvent(OrderCreated)
  public async orderCreated(event: IncomingMessage<OrderCreatedPayload>): Promise<void> {
    const { orderId, orderDetails, deliveryAddress } = event.payload;
    await this.deliveriesService.createDelivery(
      DeliveryId.of(orderId),
      ConsumerId.of(orderDetails.consumerId),
      RestaurantId.of(orderDetails.restaurantId),
      Address.of(deliveryAddress),
    );
  }

  @OnEvent(OrderRejected)
  public async orderRejected(event: IncomingMessage<OrderRejectedPayload>): Promise<void> {
    await this.deliveriesService.cancelDelivery(DeliveryId.of(event.payload.orderId));
  }

  @OnEvent(OrderCancelled)
  public async orderCancelled(event: IncomingMessage<OrderCancelledPayload>): Promise<void> {
    await this.deliveriesService.cancelDelivery(DeliveryId.of(event.payload.orderId));
  }
}
