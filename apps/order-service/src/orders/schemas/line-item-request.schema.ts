import { Type, type Static } from 'typebox';

export const LineItemRequest = Type.Object(
  {
    menuItemId: Type.String({ pattern: '^[a-z0-9-]{1,64}$' }),
    quantity: Type.Integer({ minimum: 1, maximum: 100 }),
  },
  { additionalProperties: false },
);
export type LineItemRequest = Static<typeof LineItemRequest>;
