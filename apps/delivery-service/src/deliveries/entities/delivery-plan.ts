import type { CourierId } from '../../couriers/entities/courier-id.js';
import { DROPOFF_DELAY } from '../deliveries.constants.js';

export class DeliveryPlan {
  private constructor(
    public readonly pickupTime: Date,
    public readonly deliveryTime: Date,
    public readonly courierId: CourierId,
  ) {}

  public static of(readyBy: Date, courierId: CourierId): DeliveryPlan {
    return new DeliveryPlan(readyBy, DROPOFF_DELAY.addTo(readyBy), courierId);
  }

  public static restore(pickupTime: Date, deliveryTime: Date, courierId: CourierId): DeliveryPlan {
    return new DeliveryPlan(pickupTime, deliveryTime, courierId);
  }
}
