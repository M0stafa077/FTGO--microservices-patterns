import type { Money } from '@ftgo/common';

import type { RestaurantId } from '../../restaurants/entities/restaurant-id.js';
import type { RestaurantName } from '../../restaurants/entities/restaurant-name.js';
import type { Restaurant } from '../../restaurants/entities/restaurant.entity.js';
import { DeliveryTimeInPast } from '../errors/delivery-time-in-past.js';
import { UnknownMenuItem } from '../errors/unknown-menu-item.js';

import type { ConsumerId } from './consumer-id.js';
import type { DeliveryInformation } from './delivery-information.js';
import type { OrderEvent } from './order-event.js';
import { OrderId } from './order-id.js';
import { OrderLineItem } from './order-line-item.js';
import { OrderLineItems } from './order-line-items.js';
import { OrderPlaced } from './order-placed.js';
import type { OrderSnapshot } from './order-snapshot.js';
import { OrderState } from './order-state.js';
import type { RequestedLineItem } from './requested-line-item.js';

export class Order {
  public readonly id: OrderId;
  public readonly consumerId: ConsumerId;
  public readonly restaurantId: RestaurantId;
  public readonly restaurantName: RestaurantName;
  public readonly lineItems: OrderLineItems;
  public readonly deliveryInformation: DeliveryInformation;
  public readonly state: OrderState;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly version: number;
  private readonly pendingEvents: OrderEvent[] = [];

  private constructor(snapshot: OrderSnapshot) {
    this.id = snapshot.id;
    this.consumerId = snapshot.consumerId;
    this.restaurantId = snapshot.restaurantId;
    this.restaurantName = snapshot.restaurantName;
    this.lineItems = snapshot.lineItems;
    this.deliveryInformation = snapshot.deliveryInformation;
    this.state = snapshot.state;
    this.createdAt = snapshot.createdAt;
    this.updatedAt = snapshot.updatedAt;
    this.version = snapshot.version;
  }

  public static place(
    consumerId: ConsumerId,
    restaurant: Restaurant,
    requestedItems: ReadonlyArray<RequestedLineItem>,
    deliveryInformation: DeliveryInformation,
    now: Date,
  ): Order {
    if (!deliveryInformation.isLaterThan(now)) {
      throw new DeliveryTimeInPast();
    }
    const order = new Order({
      id: OrderId.generate(),
      consumerId,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      lineItems: OrderLineItems.of(requestedItems.map((item) => Order.price(restaurant, item))),
      deliveryInformation,
      state: OrderState.ApprovalPending,
      createdAt: now,
      updatedAt: now,
      version: 0,
    });
    order.pendingEvents.push(new OrderPlaced(order));
    return order;
  }

  public static restore(snapshot: OrderSnapshot): Order {
    return new Order(snapshot);
  }

  private static price(restaurant: Restaurant, requested: RequestedLineItem): OrderLineItem {
    const menuItem = restaurant.findMenuItem(requested.menuItemId);
    if (menuItem === undefined) {
      throw new UnknownMenuItem(requested.menuItemId);
    }
    return OrderLineItem.of(menuItem.id, menuItem.name, menuItem.price, requested.quantity);
  }

  public total(): Money {
    return this.lineItems.total();
  }

  public isPlacedBy(consumerId: ConsumerId): boolean {
    return this.consumerId.equals(consumerId);
  }

  public releaseEvents(): ReadonlyArray<OrderEvent> {
    return this.pendingEvents.splice(0);
  }
}
