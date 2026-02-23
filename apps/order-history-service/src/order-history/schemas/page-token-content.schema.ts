import { Type, type Static } from 'typebox';

export const PageTokenContent = Type.Object(
  {
    createdAt: Type.String({ format: 'date-time' }),
    orderId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
export type PageTokenContent = Static<typeof PageTokenContent>;
