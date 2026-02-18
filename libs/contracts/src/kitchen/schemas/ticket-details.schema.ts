import { Type, type Static } from 'typebox';

import { TicketLineItem } from './ticket-line-item.schema.js';

export const TicketDetails = Type.Object(
  {
    lineItems: Type.Array(TicketLineItem, { minItems: 1, maxItems: 50 }),
  },
  { additionalProperties: false },
);
export type TicketDetails = Static<typeof TicketDetails>;
