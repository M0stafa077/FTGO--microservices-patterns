import { Type, type Static } from 'typebox';

export const TicketCommandPayload = Type.Object(
  {
    ticketId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
export type TicketCommandPayload = Static<typeof TicketCommandPayload>;
