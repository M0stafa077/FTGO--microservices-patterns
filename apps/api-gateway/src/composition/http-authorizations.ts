import { CompiledSchema } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';

import { ServiceName } from '../config/service-name.js';

import type { Authorizations } from './authorizations.js';
import type { ConsumerId } from './entities/consumer-id.js';
import type { OrderId } from './entities/order-id.js';
import { AuthorizationView } from './schemas/authorization-view.schema.js';
import { ServiceCalls } from './service-calls.js';

@Injectable()
export class HttpAuthorizations implements Authorizations {
  private readonly schema = new CompiledSchema(AuthorizationView);

  public constructor(@Inject(ServiceCalls) private readonly calls: ServiceCalls) {}

  public async find(
    consumerId: ConsumerId,
    orderId: OrderId,
    authorization: string,
  ): Promise<AuthorizationView | undefined> {
    return this.calls.find(
      ServiceName.Accounting,
      `/accounts/${consumerId.toString()}/authorizations/${orderId.toString()}`,
      authorization,
      this.schema,
    );
  }
}
