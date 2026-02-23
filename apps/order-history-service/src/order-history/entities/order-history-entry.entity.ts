import type { Money } from '@ftgo/common';

import { IllegalStateTransition } from '../errors/illegal-state-transition.js';

import type { ConsumerId } from './consumer-id.js';
import type { HistoryLineItem } from './history-line-item.js';
import { Keywords } from './keywords.js';
import type { OrderHistoryEntrySnapshot } from './order-history-entry-snapshot.js';
import type { OrderId } from './order-id.js';
import { OrderState } from './order-state.js';
import type { PlacedOrder } from './placed-order.js';
import type { RestaurantId } from './restaurant-id.js';

export class OrderHistoryEntry {
  public readonly id: OrderId;
  public readonly consumerId: ConsumerId;
  public readonly restaurantId: RestaurantId;
  public readonly restaurantName: string;
  public readonly createdAt: Date;
  public readonly version: number;
  private currentState: OrderState;
  private currentLineItems: ReadonlyArray<HistoryLineItem>;
  private currentTotal: Money;
  private lastUpdatedAt: Date;

  private constructor(snapshot: OrderHistoryEntrySnapshot) {
    this.id = snapshot.id;
    this.consumerId = snapshot.consumerId;
    this.restaurantId = snapshot.restaurantId;
    this.restaurantName = snapshot.restaurantName;
    this.currentLineItems = snapshot.lineItems;
    this.currentTotal = snapshot.orderTotal;
    this.currentState = snapshot.state;
    this.createdAt = snapshot.createdAt;
    this.lastUpdatedAt = snapshot.updatedAt;
    this.version = snapshot.version;
  }

  public get state(): OrderState {
    return this.currentState;
  }

  public get lineItems(): ReadonlyArray<HistoryLineItem> {
    return this.currentLineItems;
  }

  public get orderTotal(): Money {
    return this.currentTotal;
  }

  public get updatedAt(): Date {
    return this.lastUpdatedAt;
  }

  public get keywords(): Keywords {
    return Keywords.ofOrder(this.restaurantName, this.currentLineItems);
  }

  public static record(order: PlacedOrder, now: Date): OrderHistoryEntry {
    return new OrderHistoryEntry({
      id: order.id,
      consumerId: order.consumerId,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
      lineItems: order.lineItems,
      orderTotal: order.orderTotal,
      state: OrderState.ApprovalPending,
      createdAt: order.placedAt,
      updatedAt: now,
      version: 0,
    });
  }

  public static restore(snapshot: OrderHistoryEntrySnapshot): OrderHistoryEntry {
    return new OrderHistoryEntry(snapshot);
  }

  public authorize(now: Date): void {
    this.move(OrderState.ApprovalPending, OrderState.Approved, now);
  }

  public reject(now: Date): void {
    this.move(OrderState.ApprovalPending, OrderState.Rejected, now);
  }

  public cancel(now: Date): void {
    this.move(OrderState.Approved, OrderState.Cancelled, now);
  }

  public revise(lineItems: ReadonlyArray<HistoryLineItem>, orderTotal: Money, now: Date): void {
    if (this.currentState !== OrderState.Approved) {
      throw new IllegalStateTransition(this.id, this.currentState, OrderState.Approved);
    }
    this.currentLineItems = lineItems;
    this.currentTotal = orderTotal;
    this.lastUpdatedAt = now;
  }

  private move(source: OrderState, target: OrderState, now: Date): void {
    if (this.currentState === target) {
      return;
    }
    if (this.currentState !== source) {
      throw new IllegalStateTransition(this.id, this.currentState, target);
    }
    this.currentState = target;
    this.lastUpdatedAt = now;
  }
}
