import { Type, type Static } from 'typebox';

export const TicketAcceptedPayload = Type.Object(
  {
    ticketId: Type.String({ format: 'uuid' }),
    readyBy: Type.String({ format: 'date-time', maxLength: 40 }),
  },
  { additionalProperties: false },
);
export type TicketAcceptedPayload = Static<typeof TicketAcceptedPayload>;
