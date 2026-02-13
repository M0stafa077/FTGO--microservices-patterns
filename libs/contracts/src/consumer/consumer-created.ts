import { EventDefinition } from '../event-definition.js';

import { CONSUMER_AGGREGATE, CONSUMER_EVENTS } from './consumer.constants.js';
import { ConsumerCreatedPayload } from './schemas/consumer-created-payload.schema.js';

export const ConsumerCreated = new EventDefinition(
  'ConsumerCreated',
  CONSUMER_EVENTS,
  CONSUMER_AGGREGATE,
  ConsumerCreatedPayload,
);
