import { EventDefinition } from '../event-definition.js';

import { TICKET_AGGREGATE, TICKET_EVENTS } from './kitchen.constants.js';
import { TicketAcceptedPayload } from './schemas/ticket-accepted-payload.schema.js';

export const TicketAccepted = new EventDefinition(
  'TicketAccepted',
  TICKET_EVENTS,
  TICKET_AGGREGATE,
  TicketAcceptedPayload,
);
