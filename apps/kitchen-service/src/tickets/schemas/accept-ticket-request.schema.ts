import { Type, type Static } from 'typebox';

export const AcceptTicketRequest = Type.Object(
  {
    readyBy: Type.String({ format: 'date-time', maxLength: 40 }),
  },
  { additionalProperties: false },
);
export type AcceptTicketRequest = Static<typeof AcceptTicketRequest>;
