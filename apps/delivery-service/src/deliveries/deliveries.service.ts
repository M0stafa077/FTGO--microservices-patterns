import { Clock, Role, Transactions, type Address } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import type { RestaurantId } from '../restaurants/entities/restaurant-id.js';
import { Restaurants } from '../restaurants/restaurants.js';

import { CourierAssignments } from './courier-assignments.js';
import { Deliveries } from './deliveries.js';
import type { ConsumerId } from './entities/consumer-id.js';
import type { DeliveryId } from './entities/delivery-id.js';
import { Delivery } from './entities/delivery.entity.js';
import { DeliveryNotFound } from './errors/delivery-not-found.js';
import { NoCourierAvailable } from './errors/no-courier-available.js';

@Injectable()
export class DeliveriesService {
  public constructor(
    @Inject(Deliveries) private readonly deliveries: Deliveries,
    @Inject(Restaurants) private readonly restaurants: Restaurants,
    @Inject(CourierAssignments) private readonly courierAssignments: CourierAssignments,
    @Inject(Transactions) private readonly transactions: Transactions,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async createDelivery(
    id: DeliveryId,
    consumerId: ConsumerId,
    restaurantId: RestaurantId,
    deliveryAddress: Address,
  ): Promise<void> {
    await this.transactions.run(async () => {
      if ((await this.deliveries.findById(id)) !== undefined) {
        return;
      }
      const restaurant = await this.restaurants.getById(restaurantId);
      await this.deliveries.add(
        Delivery.create(id, consumerId, restaurant, deliveryAddress, this.clock.now()),
      );
    });
  }

  public async scheduleDelivery(id: DeliveryId, readyBy: Date): Promise<void> {
    await this.transactions.run(async () => {
      const delivery = await this.deliveries.getById(id);
      const courierId = await this.courierAssignments.leastBusy();
      if (courierId === undefined) {
        throw new NoCourierAvailable(id);
      }
      delivery.schedule(readyBy, courierId, this.clock.now());
      await this.deliveries.update(delivery);
    });
  }

  public async cancelDelivery(id: DeliveryId): Promise<void> {
    await this.transactions.run(async () => {
      const delivery = await this.deliveries.findById(id);
      if (delivery === undefined) {
        return;
      }
      delivery.cancel(this.clock.now());
      await this.deliveries.update(delivery);
    });
  }

  public async getDelivery(
    id: DeliveryId,
    reader: ConsumerId,
    readerRole: Role,
  ): Promise<Delivery> {
    const delivery = await this.deliveries.findById(id);
    if (delivery === undefined || (readerRole !== Role.Admin && !delivery.isFor(reader))) {
      throw new DeliveryNotFound(id);
    }
    return delivery;
  }
}
