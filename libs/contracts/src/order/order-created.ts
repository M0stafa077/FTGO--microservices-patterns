import { EventDefinition } from '../event-definition.js';

import { ORDER_AGGREGATE, ORDER_EVENTS } from './order.constants.js';
import { OrderCreatedPayload } from './schemas/order-created-payload.schema.js';

export const OrderCreated = new EventDefinition(
  'OrderCreated',
  ORDER_EVENTS,
  ORDER_AGGREGATE,
  OrderCreatedPayload,
);
