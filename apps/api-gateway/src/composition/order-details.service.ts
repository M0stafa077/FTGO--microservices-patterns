import { ServiceUnavailable } from '@ftgo/common';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { Authorizations } from './authorizations.js';
import { Deliveries } from './deliveries.js';
import { ConsumerId } from './entities/consumer-id.js';
import type { OrderId } from './entities/order-id.js';
import { OrderDetails } from './order-details.js';
import { OrderPart } from './order-part.js';
import { Orders } from './orders.js';
import { Tickets } from './tickets.js';

@Injectable()
export class OrderDetailsService {
  private readonly logger = new Logger(OrderDetailsService.name);

  public constructor(
    @Inject(Orders) private readonly orders: Orders,
    @Inject(Tickets) private readonly tickets: Tickets,
    @Inject(Deliveries) private readonly deliveries: Deliveries,
    @Inject(Authorizations) private readonly authorizations: Authorizations,
  ) {}

  public async getOrderDetails(orderId: OrderId, authorization: string): Promise<OrderDetails> {
    const order = await this.orders.getById(orderId, authorization);
    const consumerId = ConsumerId.of(order.consumerId);
    const unavailable = new Set<OrderPart>();
    const [ticket, delivery, payment] = await Promise.all([
      this.partOrNothing(OrderPart.Ticket, unavailable, async () =>
        this.tickets.findByOrderId(orderId, authorization),
      ),
      this.partOrNothing(OrderPart.Delivery, unavailable, async () =>
        this.deliveries.findByOrderId(orderId, authorization),
      ),
      this.partOrNothing(OrderPart.Authorization, unavailable, async () =>
        this.authorizations.find(consumerId, orderId, authorization),
      ),
    ]);
    const missing = Object.values(OrderPart).filter((part) => unavailable.has(part));
    return new OrderDetails(order, ticket, delivery, payment, missing);
  }

  private async partOrNothing<T>(
    part: OrderPart,
    unavailable: Set<OrderPart>,
    lookup: () => Promise<T | undefined>,
  ): Promise<T | undefined> {
    try {
      return await lookup();
    } catch (error) {
      if (!(error instanceof ServiceUnavailable)) {
        throw error;
      }
      this.logger.warn(
        { err: error, part, code: error.code },
        'An order details part is unavailable.',
      );
      unavailable.add(part);
      return undefined;
    }
  }
}
