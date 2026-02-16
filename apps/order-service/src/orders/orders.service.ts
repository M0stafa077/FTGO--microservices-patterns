import { Clock, Role, Transactions } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import type { RestaurantId } from '../restaurants/entities/restaurant-id.js';
import { Restaurants } from '../restaurants/restaurants.js';

import type { ConsumerId } from './entities/consumer-id.js';
import type { DeliveryInformation } from './entities/delivery-information.js';
import type { OrderId } from './entities/order-id.js';
import { Order } from './entities/order.entity.js';
import type { RequestedLineItem } from './entities/requested-line-item.js';
import { OrderNotFound } from './errors/order-not-found.js';
import { UnknownRestaurant } from './errors/unknown-restaurant.js';
import { OrderEvents } from './order-events.js';
import { Orders } from './orders.js';

@Injectable()
export class OrdersService {
  public constructor(
    @Inject(Orders) private readonly orders: Orders,
    @Inject(Restaurants) private readonly restaurants: Restaurants,
    @Inject(Transactions) private readonly transactions: Transactions,
    private readonly orderEvents: OrderEvents,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async placeOrder(
    consumerId: ConsumerId,
    restaurantId: RestaurantId,
    lineItems: ReadonlyArray<RequestedLineItem>,
    deliveryInformation: DeliveryInformation,
  ): Promise<Order> {
    return this.transactions.run(async () => {
      const restaurant = await this.restaurants.findById(restaurantId);
      if (restaurant === undefined) {
        throw new UnknownRestaurant(restaurantId);
      }
      const order = Order.place(
        consumerId,
        restaurant,
        lineItems,
        deliveryInformation,
        this.clock.now(),
      );
      await this.orders.add(order);
      await this.orderEvents.appendEventsOf(order);
      return order;
    });
  }

  public async getOrder(id: OrderId, reader: ConsumerId, readerRole: Role): Promise<Order> {
    const order = await this.orders.findById(id);
    if (order === undefined || (readerRole !== Role.Admin && !order.isPlacedBy(reader))) {
      throw new OrderNotFound(id);
    }
    return order;
  }
}
