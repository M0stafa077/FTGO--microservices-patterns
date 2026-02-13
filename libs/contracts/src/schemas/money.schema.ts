import { Type, type Static } from 'typebox';

export const Money = Type.Object(
  {
    amount: Type.Integer({ minimum: 0, maximum: Number.MAX_SAFE_INTEGER }),
    currency: Type.String({ pattern: '^[A-Z]{3}$' }),
  },
  { additionalProperties: false },
);
export type Money = Static<typeof Money>;
