import type { RestaurantId } from '../../restaurants/entities/restaurant-id.js';
import type { Restaurant } from '../../restaurants/entities/restaurant.entity.js';
import { IllegalStateTransition } from '../errors/illegal-state-transition.js';

import type { RevisedLineItem } from './revised-line-item.js';
import type { TicketId } from './ticket-id.js';
import type { TicketLineItems } from './ticket-line-items.js';
import type { TicketSnapshot } from './ticket-snapshot.js';
import { TicketState } from './ticket-state.js';

export class Ticket {
  public readonly id: TicketId;
  public readonly restaurantId: RestaurantId;
  public readonly createdAt: Date;
  public readonly version: number;
  private currentState: TicketState;
  private lastUpdatedAt: Date;
  private currentLineItems: TicketLineItems;

  private constructor(snapshot: TicketSnapshot) {
    this.id = snapshot.id;
    this.restaurantId = snapshot.restaurantId;
    this.currentLineItems = snapshot.lineItems;
    this.createdAt = snapshot.createdAt;
    this.version = snapshot.version;
    this.currentState = snapshot.state;
    this.lastUpdatedAt = snapshot.updatedAt;
  }

  public get state(): TicketState {
    return this.currentState;
  }

  public get lineItems(): TicketLineItems {
    return this.currentLineItems;
  }

  public get updatedAt(): Date {
    return this.lastUpdatedAt;
  }

  public static create(
    id: TicketId,
    restaurant: Restaurant,
    lineItems: TicketLineItems,
    now: Date,
  ): Ticket {
    lineItems.verifyOfferedBy(restaurant);
    return new Ticket({
      id,
      restaurantId: restaurant.id,
      lineItems,
      state: TicketState.CreatePending,
      createdAt: now,
      updatedAt: now,
      version: 0,
    });
  }

  public static restore(snapshot: TicketSnapshot): Ticket {
    return new Ticket(snapshot);
  }

  public confirmCreate(now: Date): void {
    this.move(TicketState.CreatePending, TicketState.AwaitingAcceptance, now);
  }

  public cancelCreate(now: Date): void {
    this.move(TicketState.CreatePending, TicketState.Cancelled, now);
  }

  public beginCancel(now: Date): void {
    this.move(TicketState.AwaitingAcceptance, TicketState.CancelPending, now);
  }

  public undoBeginCancel(now: Date): void {
    this.move(TicketState.CancelPending, TicketState.AwaitingAcceptance, now);
  }

  public confirmCancel(now: Date): void {
    this.move(TicketState.CancelPending, TicketState.Cancelled, now);
  }

  public beginRevise(revisions: ReadonlyArray<RevisedLineItem>, now: Date): void {
    if (this.currentState === TicketState.RevisionPending) {
      return;
    }
    this.currentLineItems.revisedWith(revisions);
    this.move(TicketState.AwaitingAcceptance, TicketState.RevisionPending, now);
  }

  public undoBeginRevise(now: Date): void {
    this.move(TicketState.RevisionPending, TicketState.AwaitingAcceptance, now);
  }

  public confirmRevise(revisions: ReadonlyArray<RevisedLineItem>, now: Date): void {
    if (this.currentState === TicketState.AwaitingAcceptance) {
      return;
    }
    const revised = this.currentLineItems.revisedWith(revisions);
    this.move(TicketState.RevisionPending, TicketState.AwaitingAcceptance, now);
    this.currentLineItems = revised;
  }

  private move(source: TicketState, target: TicketState, now: Date): void {
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
