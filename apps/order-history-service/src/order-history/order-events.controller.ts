import {
  OrderAuthorized,
  OrderCancelled,
  OrderCreated,
  OrderRejected,
  OrderRevised,
  type OrderAuthorizedPayload,
  type OrderCancelledPayload,
  type OrderCreatedPayload,
  type OrderRejectedPayload,
  type OrderRevisedPayload,
} from '@ftgo/contracts';
import type { IncomingMessage } from '@ftgo/messaging';
import { MessageController, OnEvent } from '@ftgo/messaging/infrastructure';
import { Injectable } from '@nestjs/common';

import { ConsumerId } from './entities/consumer-id.js';
import { OrderId } from './entities/order-id.js';
import { RestaurantId } from './entities/restaurant-id.js';
import { LineItemPayloads } from './line-item-payloads.js';
import { OrderHistoryService } from './order-history.service.js';

@MessageController()
@Injectable()
export class OrderEventsController {
  private readonly payloads = new LineItemPayloads();

  public constructor(private readonly orderHistoryService: OrderHistoryService) {}

  @OnEvent(OrderCreated)
  public async orderCreated(event: IncomingMessage<OrderCreatedPayload>): Promise<void> {
    const { orderId, orderDetails, restaurantName } = event.payload;
    await this.orderHistoryService.recordOrder({
      id: OrderId.of(orderId),
      consumerId: ConsumerId.of(orderDetails.consumerId),
      restaurantId: RestaurantId.of(orderDetails.restaurantId),
      restaurantName,
      lineItems: this.payloads.toLineItems(orderDetails.lineItems),
      orderTotal: this.payloads.toMoney(orderDetails.orderTotal),
      placedAt: event.timestamp,
    });
  }

  @OnEvent(OrderAuthorized)
  public async orderAuthorized(event: IncomingMessage<OrderAuthorizedPayload>): Promise<void> {
    await this.orderHistoryService.authorizeOrder(OrderId.of(event.payload.orderId));
  }

  @OnEvent(OrderRejected)
  public async orderRejected(event: IncomingMessage<OrderRejectedPayload>): Promise<void> {
    await this.orderHistoryService.rejectOrder(OrderId.of(event.payload.orderId));
  }

  @OnEvent(OrderCancelled)
  public async orderCancelled(event: IncomingMessage<OrderCancelledPayload>): Promise<void> {
    await this.orderHistoryService.cancelOrder(OrderId.of(event.payload.orderId));
  }

  @OnEvent(OrderRevised)
  public async orderRevised(event: IncomingMessage<OrderRevisedPayload>): Promise<void> {
    const { orderId, lineItems, orderTotal } = event.payload;
    await this.orderHistoryService.reviseOrder(
      OrderId.of(orderId),
      this.payloads.toLineItems(lineItems),
      this.payloads.toMoney(orderTotal),
    );
  }
}
