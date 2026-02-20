import { EventDefinition } from '../event-definition.js';

import { ORDER_AGGREGATE, ORDER_EVENTS } from './order.constants.js';
import { OrderCancelledPayload } from './schemas/order-cancelled-payload.schema.js';

export const OrderCancelled = new EventDefinition(
  'OrderCancelled',
  ORDER_EVENTS,
  ORDER_AGGREGATE,
  OrderCancelledPayload,
);
