import { Type, type Static } from 'typebox';

export const CreateTicketReplyPayload = Type.Object(
  {
    ticketId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
export type CreateTicketReplyPayload = Static<typeof CreateTicketReplyPayload>;
