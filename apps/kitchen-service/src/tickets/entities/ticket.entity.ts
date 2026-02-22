import type { RestaurantId } from '../../restaurants/entities/restaurant-id.js';
import type { Restaurant } from '../../restaurants/entities/restaurant.entity.js';
import { IllegalStateTransition } from '../errors/illegal-state-transition.js';
import { ReadyByNotInFuture } from '../errors/ready-by-not-in-future.js';
import { LOCKABLE_TICKET_STATES } from '../tickets.constants.js';

import type { ConsumerId } from './consumer-id.js';
import type { RevisedLineItem } from './revised-line-item.js';
import { TicketAccepted } from './ticket-accepted.js';
import type { TicketId } from './ticket-id.js';
import type { TicketLineItems } from './ticket-line-items.js';
import type { TicketSnapshot } from './ticket-snapshot.js';
import { TicketState } from './ticket-state.js';

export class Ticket {
  public readonly id: TicketId;
  public readonly restaurantId: RestaurantId;
  public readonly consumerId: ConsumerId | undefined;
  public readonly createdAt: Date;
  public readonly version: number;
  private currentState: TicketState;
  private lockedFrom: TicketState | undefined;
  private plannedReadyBy: Date | undefined;
  private acceptTime: Date | undefined;
  private lastUpdatedAt: Date;
  private currentLineItems: TicketLineItems;
  private readonly pendingEvents: TicketAccepted[] = [];

  private constructor(snapshot: TicketSnapshot) {
    this.id = snapshot.id;
    this.restaurantId = snapshot.restaurantId;
    this.consumerId = snapshot.consumerId;
    this.currentLineItems = snapshot.lineItems;
    this.createdAt = snapshot.createdAt;
    this.version = snapshot.version;
    this.currentState = snapshot.state;
    this.lockedFrom = snapshot.previousState;
    this.plannedReadyBy = snapshot.readyBy;
    this.acceptTime = snapshot.acceptedAt;
    this.lastUpdatedAt = snapshot.updatedAt;
  }

  public get state(): TicketState {
    return this.currentState;
  }

  public get previousState(): TicketState | undefined {
    return this.lockedFrom;
  }

  public get readyBy(): Date | undefined {
    return this.plannedReadyBy;
  }

  public get acceptedAt(): Date | undefined {
    return this.acceptTime;
  }

  public get lineItems(): TicketLineItems {
    return this.currentLineItems;
  }

  public get updatedAt(): Date {
    return this.lastUpdatedAt;
  }

  public static create(
    id: TicketId,
    consumerId: ConsumerId,
    restaurant: Restaurant,
    lineItems: TicketLineItems,
    now: Date,
  ): Ticket {
    lineItems.verifyOfferedBy(restaurant);
    return new Ticket({
      id,
      restaurantId: restaurant.id,
      consumerId,
      lineItems,
      state: TicketState.CreatePending,
      previousState: undefined,
      readyBy: undefined,
      acceptedAt: undefined,
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

  public accept(readyBy: Date, now: Date): void {
    if (this.currentState !== TicketState.AwaitingAcceptance) {
      throw new IllegalStateTransition(this.id, this.currentState, TicketState.Accepted);
    }
    if (readyBy.getTime() <= now.getTime()) {
      throw new ReadyByNotInFuture(this.id, readyBy);
    }
    this.currentState = TicketState.Accepted;
    this.plannedReadyBy = readyBy;
    this.acceptTime = now;
    this.lastUpdatedAt = now;
    this.pendingEvents.push(new TicketAccepted(this.id, readyBy));
  }

  public beginCancel(now: Date): void {
    this.lock(TicketState.CancelPending, now);
  }

  public undoBeginCancel(now: Date): void {
    this.unlock(TicketState.CancelPending, now);
  }

  public confirmCancel(now: Date): void {
    this.move(TicketState.CancelPending, TicketState.Cancelled, now);
    this.lockedFrom = undefined;
  }

  public beginRevise(revisions: ReadonlyArray<RevisedLineItem>, now: Date): void {
    if (this.currentState === TicketState.RevisionPending) {
      return;
    }
    this.currentLineItems.revisedWith(revisions);
    this.lock(TicketState.RevisionPending, now);
  }

  public undoBeginRevise(now: Date): void {
    this.unlock(TicketState.RevisionPending, now);
  }

  public confirmRevise(revisions: ReadonlyArray<RevisedLineItem>, now: Date): void {
    if (this.isUnlocked()) {
      return;
    }
    const revised = this.currentLineItems.revisedWith(revisions);
    this.unlock(TicketState.RevisionPending, now);
    this.currentLineItems = revised;
  }

  public isFor(consumerId: ConsumerId): boolean {
    return this.consumerId?.equals(consumerId) === true;
  }

  public releaseEvents(): ReadonlyArray<TicketAccepted> {
    return this.pendingEvents.splice(0);
  }

  private isUnlocked(): boolean {
    return LOCKABLE_TICKET_STATES.has(this.currentState);
  }

  private lock(target: TicketState, now: Date): void {
    if (this.currentState === target) {
      return;
    }
    if (!this.isUnlocked()) {
      throw new IllegalStateTransition(this.id, this.currentState, target);
    }
    this.lockedFrom = this.currentState;
    this.currentState = target;
    this.lastUpdatedAt = now;
  }

  private unlock(source: TicketState, now: Date): void {
    if (this.isUnlocked()) {
      return;
    }
    const previous = this.lockedFrom;
    if (this.currentState !== source || previous === undefined) {
      throw new IllegalStateTransition(
        this.id,
        this.currentState,
        previous ?? TicketState.AwaitingAcceptance,
      );
    }
    this.currentState = previous;
    this.lockedFrom = undefined;
    this.lastUpdatedAt = now;
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
