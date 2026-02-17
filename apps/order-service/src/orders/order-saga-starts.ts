import { Sagas } from '@ftgo/saga';
import { Inject, Injectable } from '@nestjs/common';

import { OrderCreation } from '../order-creation/order-creation.js';

import type { OrderEventTranslation } from './entities/order-event-translation.js';
import type { OrderPlaced } from './entities/order-placed.js';

@Injectable()
export class OrderSagaStarts implements OrderEventTranslation<Promise<void>> {
  public constructor(
    @Inject(Sagas) private readonly sagas: Sagas,
    private readonly orderCreation: OrderCreation,
  ) {}

  public async orderPlaced(event: OrderPlaced): Promise<void> {
    const { order } = event;
    const total = order.total();
    await this.sagas.start(this.orderCreation, {
      orderId: order.id.toString(),
      consumerId: order.consumerId.toString(),
      orderTotal: { amount: total.amount, currency: total.currency.toString() },
    });
  }

  public async orderApproved(): Promise<void> {
    await Promise.resolve();
  }

  public async orderRejected(): Promise<void> {
    await Promise.resolve();
  }
}
