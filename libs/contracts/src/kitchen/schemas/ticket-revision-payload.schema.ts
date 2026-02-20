import { Type, type Static } from 'typebox';

import { RevisedLineItem } from './revised-line-item.schema.js';

export const TicketRevisionPayload = Type.Object(
  {
    ticketId: Type.String({ format: 'uuid' }),
    revisedLineItems: Type.Array(RevisedLineItem, { minItems: 1, maxItems: 50 }),
  },
  { additionalProperties: false },
);
export type TicketRevisionPayload = Static<typeof TicketRevisionPayload>;
