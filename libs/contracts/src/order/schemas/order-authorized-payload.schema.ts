import { Type, type Static } from 'typebox';

export const OrderAuthorizedPayload = Type.Object(
  {
    orderId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
export type OrderAuthorizedPayload = Static<typeof OrderAuthorizedPayload>;
