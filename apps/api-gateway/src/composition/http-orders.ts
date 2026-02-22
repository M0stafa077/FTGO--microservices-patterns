import { CompiledSchema } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { ServiceName } from '../config/service-name.js';

import type { OrderId } from './entities/order-id.js';
import { OrderNotFound } from './errors/order-not-found.js';
import type { Orders } from './orders.js';
import { OrderView } from './schemas/order-view.schema.js';
import { ServiceCalls } from './service-calls.js';

@Injectable()
export class HttpOrders implements Orders {
  private readonly schema = new CompiledSchema(OrderView);

  public constructor(@Inject(ServiceCalls) private readonly calls: ServiceCalls) {}

  public async getById(id: OrderId, authorization: string): Promise<OrderView> {
    const order = await this.calls.find(
      ServiceName.Order,
      `/orders/${id.toString()}`,
      authorization,
      this.schema,
    );
    if (order === undefined) {
      throw new OrderNotFound(id);
    }
    return order;
  }
}
