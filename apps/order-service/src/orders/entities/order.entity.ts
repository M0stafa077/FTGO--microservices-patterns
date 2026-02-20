import type { Money } from '@ftgo/common';

import type { RestaurantId } from '../../restaurants/entities/restaurant-id.js';
import type { RestaurantName } from '../../restaurants/entities/restaurant-name.js';
import type { Restaurant } from '../../restaurants/entities/restaurant.entity.js';
import { DeliveryTimeInPast } from '../errors/delivery-time-in-past.js';
import { IllegalStateTransition } from '../errors/illegal-state-transition.js';
import { UnknownMenuItem } from '../errors/unknown-menu-item.js';

import type { ConsumerId } from './consumer-id.js';
import type { DeliveryInformation } from './delivery-information.js';
import { OrderApproved } from './order-approved.js';
import { OrderCancellationRequested } from './order-cancellation-requested.js';
import { OrderCancelled } from './order-cancelled.js';
import type { OrderEvent } from './order-event.js';
import { OrderId } from './order-id.js';
import { OrderLineItem } from './order-line-item.js';
import { OrderLineItems } from './order-line-items.js';
import { OrderPlaced } from './order-placed.js';
import { OrderRejected } from './order-rejected.js';
import { OrderRevisionProposed } from './order-revision-proposed.js';
import type { OrderSnapshot } from './order-snapshot.js';
import { OrderState } from './order-state.js';
import type { RequestedLineItem } from './requested-line-item.js';

export class Order {
  public readonly id: OrderId;
  public readonly consumerId: ConsumerId;
  public readonly restaurantId: RestaurantId;
  public readonly restaurantName: RestaurantName;
  public readonly deliveryInformation: DeliveryInformation;
  public readonly createdAt: Date;
  public readonly version: number;
  private currentState: OrderState;
  private lastUpdatedAt: Date;
  private currentLineItems: OrderLineItems;
  private readonly pendingEvents: OrderEvent[] = [];

  private constructor(snapshot: OrderSnapshot) {
    this.id = snapshot.id;
    this.consumerId = snapshot.consumerId;
    this.restaurantId = snapshot.restaurantId;
    this.restaurantName = snapshot.restaurantName;
    this.currentLineItems = snapshot.lineItems;
    this.deliveryInformation = snapshot.deliveryInformation;
    this.createdAt = snapshot.createdAt;
    this.version = snapshot.version;
    this.currentState = snapshot.state;
    this.lastUpdatedAt = snapshot.updatedAt;
  }

  public get state(): OrderState {
    return this.currentState;
  }

  public get lineItems(): OrderLineItems {
    return this.currentLineItems;
  }

  public get updatedAt(): Date {
    return this.lastUpdatedAt;
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

  public approve(now: Date): void {
    this.move(OrderState.ApprovalPending, OrderState.Approved, now);
    this.pendingEvents.push(new OrderApproved(this.id));
  }

  public reject(now: Date): void {
    this.move(OrderState.ApprovalPending, OrderState.Rejected, now);
    this.pendingEvents.push(new OrderRejected(this.id));
  }

  public cancel(now: Date): void {
    this.move(OrderState.Approved, OrderState.CancelPending, now);
    this.pendingEvents.push(new OrderCancellationRequested(this));
  }

  public undoCancel(now: Date): void {
    this.move(OrderState.CancelPending, OrderState.Approved, now);
  }

  public confirmCancel(now: Date): void {
    this.move(OrderState.CancelPending, OrderState.Cancelled, now);
    this.pendingEvents.push(new OrderCancelled(this.id));
  }

  public revise(revisions: ReadonlyArray<RequestedLineItem>, now: Date): void {
    const revised = this.currentLineItems.revisedWith(revisions);
    this.move(OrderState.Approved, OrderState.RevisionPending, now);
    this.pendingEvents.push(new OrderRevisionProposed(this, revisions, revised.total()));
  }

  public undoRevision(now: Date): void {
    this.move(OrderState.RevisionPending, OrderState.Approved, now);
  }

  public confirmRevision(revisions: ReadonlyArray<RequestedLineItem>, now: Date): void {
    const revised = this.currentLineItems.revisedWith(revisions);
    this.move(OrderState.RevisionPending, OrderState.Approved, now);
    this.currentLineItems = revised;
  }

  public isPlacedBy(consumerId: ConsumerId): boolean {
    return this.consumerId.equals(consumerId);
  }

  public releaseEvents(): ReadonlyArray<OrderEvent> {
    return this.pendingEvents.splice(0);
  }

  private move(source: OrderState, target: OrderState, now: Date): void {
    if (this.currentState !== source) {
      throw new IllegalStateTransition(this.id, this.currentState, target);
    }
    this.currentState = target;
    this.lastUpdatedAt = now;
  }
}
