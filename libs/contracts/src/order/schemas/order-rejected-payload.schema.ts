import { Type, type Static } from 'typebox';

export const OrderRejectedPayload = Type.Object(
  {
    orderId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
export type OrderRejectedPayload = Static<typeof OrderRejectedPayload>;
