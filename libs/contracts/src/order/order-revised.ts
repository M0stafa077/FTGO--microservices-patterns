import { EventDefinition } from '../event-definition.js';

import { ORDER_AGGREGATE, ORDER_EVENTS } from './order.constants.js';
import { OrderRevisedPayload } from './schemas/order-revised-payload.schema.js';

export const OrderRevised = new EventDefinition(
  'OrderRevised',
  ORDER_EVENTS,
  ORDER_AGGREGATE,
  OrderRevisedPayload,
);
