import type { Address, Money, OrderLineItem as OrderLineItemPayload } from '@ftgo/contracts';

import type { Order } from '../entities/order.entity.js';
import { PublishedOrder } from '../published-order.js';

export class OrderResponse {
  public readonly id: string;
  public readonly state: string;
  public readonly consumerId: string;
  public readonly restaurantId: string;
  public readonly restaurantName: string;
  public readonly lineItems: ReadonlyArray<OrderLineItemPayload>;
  public readonly orderTotal: Money;
  public readonly deliveryAddress: Address;
  public readonly deliveryTime: string;
  public readonly createdAt: string;

  public constructor(order: Order) {
    const published = new PublishedOrder(order);
    this.id = order.id.toString();
    this.state = order.state;
    this.consumerId = order.consumerId.toString();
    this.restaurantId = order.restaurantId.toString();
    this.restaurantName = order.restaurantName.toString();
    this.lineItems = published.lineItems();
    this.orderTotal = published.total();
    this.deliveryAddress = published.deliveryAddress();
    this.deliveryTime = order.deliveryInformation.time.toISOString();
    this.createdAt = order.createdAt.toISOString();
  }
}
