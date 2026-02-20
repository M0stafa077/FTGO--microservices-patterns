import { Type, type Static } from 'typebox';

export const RevisedLineItem = Type.Object(
  {
    menuItemId: Type.String({ pattern: '^[a-z0-9-]{1,64}$' }),
    quantity: Type.Integer({ minimum: 1, maximum: 100 }),
  },
  { additionalProperties: false },
);
export type RevisedLineItem = Static<typeof RevisedLineItem>;
