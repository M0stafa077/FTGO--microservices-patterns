import { Address, InvalidInput } from '@ftgo/common';

import { CourierId } from '../couriers/entities/courier-id.js';
import type { DeliveriesTable } from '../database/tables/deliveries.table.js';
import { RestaurantId } from '../restaurants/entities/restaurant-id.js';

import { DELIVERY_STATES } from './deliveries.constants.js';
import { ConsumerId } from './entities/consumer-id.js';
import { DeliveryId } from './entities/delivery-id.js';
import { DeliveryPlan } from './entities/delivery-plan.js';
import type { DeliveryState } from './entities/delivery-state.js';
import { Delivery } from './entities/delivery.entity.js';

export class DeliveryRecord {
  private constructor(private readonly row: DeliveriesTable) {}

  public static fromRow(row: DeliveriesTable): DeliveryRecord {
    return new DeliveryRecord(row);
  }

  public static from(delivery: Delivery): DeliveryRecord {
    const { pickupAddress: pickup, deliveryAddress: destination, plan } = delivery;
    return new DeliveryRecord({
      id: delivery.id.toString(),
      consumerId: delivery.consumerId.toString(),
      restaurantId: delivery.restaurantId.toString(),
      state: delivery.state,
      pickupStreet1: pickup.street1,
      pickupStreet2: pickup.street2 ?? null,
      pickupCity: pickup.city,
      pickupState: pickup.state,
      pickupZip: pickup.zip,
      deliveryStreet1: destination.street1,
      deliveryStreet2: destination.street2 ?? null,
      deliveryCity: destination.city,
      deliveryState: destination.state,
      deliveryZip: destination.zip,
      pickupTime: plan?.pickupTime ?? null,
      deliveryTime: plan?.deliveryTime ?? null,
      courierId: plan?.courierId.toString() ?? null,
      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt,
      version: delivery.version,
    });
  }

  public toDelivery(): Delivery {
    const { row } = this;
    return Delivery.restore({
      id: DeliveryId.of(row.id),
      consumerId: ConsumerId.of(row.consumerId),
      restaurantId: RestaurantId.of(row.restaurantId),
      pickupAddress: this.pickupAddress(),
      deliveryAddress: this.deliveryAddress(),
      state: this.state(),
      plan: this.plan(),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      version: row.version,
    });
  }

  public deliveryRow(): DeliveriesTable {
    return { ...this.row };
  }

  private pickupAddress(): Address {
    const { row } = this;
    return this.addressOf(
      row.pickupStreet1,
      row.pickupStreet2,
      row.pickupCity,
      row.pickupState,
      row.pickupZip,
    );
  }

  private deliveryAddress(): Address {
    const { row } = this;
    return this.addressOf(
      row.deliveryStreet1,
      row.deliveryStreet2,
      row.deliveryCity,
      row.deliveryState,
      row.deliveryZip,
    );
  }

  private addressOf(
    street1: string,
    street2: string | null,
    city: string,
    state: string,
    zip: string,
  ): Address {
    return Address.of({ street1, street2: street2 ?? undefined, city, state, zip });
  }

  private plan(): DeliveryPlan | undefined {
    const { pickupTime, deliveryTime, courierId } = this.row;
    if (pickupTime === null || deliveryTime === null || courierId === null) {
      return undefined;
    }
    return DeliveryPlan.restore(pickupTime, deliveryTime, CourierId.of(courierId));
  }

  private state(): DeliveryState {
    const state = DELIVERY_STATES.get(this.row.state);
    if (state === undefined) {
      throw new InvalidInput(
        'delivery.unknown_state',
        `Unknown delivery state "${this.row.state}".`,
      );
    }
    return state;
  }
}
