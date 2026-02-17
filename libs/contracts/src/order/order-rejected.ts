import { EventDefinition } from '../event-definition.js';

import { ORDER_AGGREGATE, ORDER_EVENTS } from './order.constants.js';
import { OrderRejectedPayload } from './schemas/order-rejected-payload.schema.js';

export const OrderRejected = new EventDefinition(
  'OrderRejected',
  ORDER_EVENTS,
  ORDER_AGGREGATE,
  OrderRejectedPayload,
);
