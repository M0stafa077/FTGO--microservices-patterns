import { CompiledSchema } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { ServiceName } from '../config/service-name.js';

import type { Deliveries } from './deliveries.js';
import type { OrderId } from './entities/order-id.js';
import { DeliveryView } from './schemas/delivery-view.schema.js';
import { ServiceCalls } from './service-calls.js';

@Injectable()
export class HttpDeliveries implements Deliveries {
  private readonly schema = new CompiledSchema(DeliveryView);

  public constructor(@Inject(ServiceCalls) private readonly calls: ServiceCalls) {}

  public async findByOrderId(
    orderId: OrderId,
    authorization: string,
  ): Promise<DeliveryView | undefined> {
    return this.calls.find(
      ServiceName.Delivery,
      `/deliveries/${orderId.toString()}`,
      authorization,
      this.schema,
    );
  }
}
