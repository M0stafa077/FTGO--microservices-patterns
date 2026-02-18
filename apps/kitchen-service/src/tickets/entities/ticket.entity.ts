import type { RestaurantId } from '../../restaurants/entities/restaurant-id.js';
import type { Restaurant } from '../../restaurants/entities/restaurant.entity.js';
import { IllegalStateTransition } from '../errors/illegal-state-transition.js';

import type { TicketId } from './ticket-id.js';
import type { TicketLineItems } from './ticket-line-items.js';
import type { TicketSnapshot } from './ticket-snapshot.js';
import { TicketState } from './ticket-state.js';

export class Ticket {
  public readonly id: TicketId;
  public readonly restaurantId: RestaurantId;
  public readonly lineItems: TicketLineItems;
  public readonly createdAt: Date;
  public readonly version: number;
  private currentState: TicketState;
  private lastUpdatedAt: Date;

  private constructor(snapshot: TicketSnapshot) {
    this.id = snapshot.id;
    this.restaurantId = snapshot.restaurantId;
    this.lineItems = snapshot.lineItems;
    this.createdAt = snapshot.createdAt;
    this.version = snapshot.version;
    this.currentState = snapshot.state;
    this.lastUpdatedAt = snapshot.updatedAt;
  }

  public get state(): TicketState {
    return this.currentState;
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
    this.leaveCreatePending(TicketState.AwaitingAcceptance, now);
  }

  public cancelCreate(now: Date): void {
    this.leaveCreatePending(TicketState.Cancelled, now);
  }

  private leaveCreatePending(target: TicketState, now: Date): void {
    if (this.currentState === target) {
      return;
    }
    if (this.currentState !== TicketState.CreatePending) {
      throw new IllegalStateTransition(this.id, this.currentState, target);
    }
    this.currentState = target;
    this.lastUpdatedAt = now;
  }
}
