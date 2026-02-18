import { Type, type Static } from 'typebox';

export const TicketLineItem = Type.Object(
  {
    menuItemId: Type.String({ pattern: '^[a-z0-9-]{1,64}$' }),
    name: Type.String({ minLength: 1, maxLength: 100 }),
    quantity: Type.Integer({ minimum: 1, maximum: 100 }),
  },
  { additionalProperties: false },
);
export type TicketLineItem = Static<typeof TicketLineItem>;
