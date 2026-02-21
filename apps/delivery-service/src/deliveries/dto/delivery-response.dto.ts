import type { Address } from '@ftgo/common';
import type { Address as AddressPayload } from '@ftgo/contracts';

import type { Delivery } from '../entities/delivery.entity.js';

export class DeliveryResponse {
  public readonly id: string;
  public readonly state: string;
  public readonly restaurantId: string;
  public readonly pickupAddress: AddressPayload;
  public readonly deliveryAddress: AddressPayload;
  public readonly pickupTime: string | null;
  public readonly deliveryTime: string | null;
  public readonly courierId: string | null;

  public constructor(delivery: Delivery) {
    const { plan } = delivery;
    this.id = delivery.id.toString();
    this.state = delivery.state;
    this.restaurantId = delivery.restaurantId.toString();
    this.pickupAddress = this.addressOf(delivery.pickupAddress);
    this.deliveryAddress = this.addressOf(delivery.deliveryAddress);
    this.pickupTime = plan?.pickupTime.toISOString() ?? null;
    this.deliveryTime = plan?.deliveryTime.toISOString() ?? null;
    this.courierId = plan?.courierId.toString() ?? null;
  }

  private addressOf(address: Address): AddressPayload {
    return {
      street1: address.street1,
      ...(address.street2 === undefined ? {} : { street2: address.street2 }),
      city: address.city,
      state: address.state,
      zip: address.zip,
    };
  }
}
