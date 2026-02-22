import { CompiledSchema } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { ServiceName } from '../config/service-name.js';

import type { OrderId } from './entities/order-id.js';
import { TicketView } from './schemas/ticket-view.schema.js';
import { ServiceCalls } from './service-calls.js';
import type { Tickets } from './tickets.js';

@Injectable()
export class HttpTickets implements Tickets {
  private readonly schema = new CompiledSchema(TicketView);

  public constructor(@Inject(ServiceCalls) private readonly calls: ServiceCalls) {}

  public async findByOrderId(
    orderId: OrderId,
    authorization: string,
  ): Promise<TicketView | undefined> {
    return this.calls.find(
      ServiceName.Kitchen,
      `/tickets/${orderId.toString()}`,
      authorization,
      this.schema,
    );
  }
}
