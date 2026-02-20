import { Type, type Static } from 'typebox';

export const OrderCancelledPayload = Type.Object(
  {
    orderId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
export type OrderCancelledPayload = Static<typeof OrderCancelledPayload>;
