import type { Address } from '@ftgo/common';

import type { CourierId } from '../../couriers/entities/courier-id.js';
import type { RestaurantId } from '../../restaurants/entities/restaurant-id.js';
import type { Restaurant } from '../../restaurants/entities/restaurant.entity.js';
import { IllegalStateTransition } from '../errors/illegal-state-transition.js';

import type { ConsumerId } from './consumer-id.js';
import type { DeliveryId } from './delivery-id.js';
import { DeliveryPlan } from './delivery-plan.js';
import type { DeliverySnapshot } from './delivery-snapshot.js';
import { DeliveryState } from './delivery-state.js';

export class Delivery {
  public readonly id: DeliveryId;
  public readonly consumerId: ConsumerId;
  public readonly restaurantId: RestaurantId;
  public readonly pickupAddress: Address;
  public readonly deliveryAddress: Address;
  public readonly createdAt: Date;
  public readonly version: number;
  private currentState: DeliveryState;
  private currentPlan: DeliveryPlan | undefined;
  private lastUpdatedAt: Date;

  private constructor(snapshot: DeliverySnapshot) {
    this.id = snapshot.id;
    this.consumerId = snapshot.consumerId;
    this.restaurantId = snapshot.restaurantId;
    this.pickupAddress = snapshot.pickupAddress;
    this.deliveryAddress = snapshot.deliveryAddress;
    this.currentState = snapshot.state;
    this.currentPlan = snapshot.plan;
    this.createdAt = snapshot.createdAt;
    this.lastUpdatedAt = snapshot.updatedAt;
    this.version = snapshot.version;
  }

  public get state(): DeliveryState {
    return this.currentState;
  }

  public get plan(): DeliveryPlan | undefined {
    return this.currentPlan;
  }

  public get updatedAt(): Date {
    return this.lastUpdatedAt;
  }

  public static create(
    id: DeliveryId,
    consumerId: ConsumerId,
    restaurant: Restaurant,
    deliveryAddress: Address,
    now: Date,
  ): Delivery {
    return new Delivery({
      id,
      consumerId,
      restaurantId: restaurant.id,
      pickupAddress: restaurant.address,
      deliveryAddress,
      state: DeliveryState.Pending,
      plan: undefined,
      createdAt: now,
      updatedAt: now,
      version: 0,
    });
  }

  public static restore(snapshot: DeliverySnapshot): Delivery {
    return new Delivery(snapshot);
  }

  public schedule(readyBy: Date, courierId: CourierId, now: Date): void {
    if (this.currentState !== DeliveryState.Pending) {
      throw new IllegalStateTransition(this.id, this.currentState, DeliveryState.Scheduled);
    }
    this.currentPlan = DeliveryPlan.of(readyBy, courierId);
    this.currentState = DeliveryState.Scheduled;
    this.lastUpdatedAt = now;
  }

  public cancel(now: Date): void {
    if (this.currentState === DeliveryState.Cancelled) {
      return;
    }
    this.currentPlan = undefined;
    this.currentState = DeliveryState.Cancelled;
    this.lastUpdatedAt = now;
  }

  public isFor(consumerId: ConsumerId): boolean {
    return this.consumerId.equals(consumerId);
  }
}
