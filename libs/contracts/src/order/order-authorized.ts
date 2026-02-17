import { EventDefinition } from '../event-definition.js';

import { ORDER_AGGREGATE, ORDER_EVENTS } from './order.constants.js';
import { OrderAuthorizedPayload } from './schemas/order-authorized-payload.schema.js';

export const OrderAuthorized = new EventDefinition(
  'OrderAuthorized',
  ORDER_EVENTS,
  ORDER_AGGREGATE,
  OrderAuthorizedPayload,
);
