import { Type, type Static } from 'typebox';

import { TicketDetails } from './ticket-details.schema.js';

export const CreateTicketPayload = Type.Object(
  {
    orderId: Type.String({ format: 'uuid' }),
    consumerId: Type.String({ format: 'uuid' }),
    restaurantId: Type.String({ format: 'uuid' }),
    ticketDetails: TicketDetails,
  },
  { additionalProperties: false },
);
export type CreateTicketPayload = Static<typeof CreateTicketPayload>;
