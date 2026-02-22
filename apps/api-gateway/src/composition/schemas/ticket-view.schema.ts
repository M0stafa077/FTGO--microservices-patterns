import { TicketLineItem } from '@ftgo/contracts';
import { Type, type Static } from 'typebox';

export const TicketView = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    restaurantId: Type.String({ format: 'uuid' }),
    state: Type.String({ minLength: 1, maxLength: 64 }),
    lineItems: Type.Array(TicketLineItem, { minItems: 1, maxItems: 100 }),
    readyBy: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
    acceptedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  },
  { additionalProperties: false },
);
export type TicketView = Static<typeof TicketView>;
