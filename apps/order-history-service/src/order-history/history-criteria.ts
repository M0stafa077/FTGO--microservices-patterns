import type { ConsumerId } from './entities/consumer-id.js';
import type { Keywords } from './entities/keywords.js';
import type { OrderState } from './entities/order-state.js';
import type { PagePosition } from './page-position.js';

export interface HistoryCriteria {
  readonly consumerId: ConsumerId;
  readonly state: OrderState | undefined;
  readonly keywords: Keywords | undefined;
  readonly since: Date | undefined;
  readonly after: PagePosition | undefined;
  readonly pageSize: number;
}
