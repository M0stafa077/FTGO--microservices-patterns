import { Money } from '@ftgo/contracts';
import { Type, type Static } from 'typebox';

export const AuthorizationRevisedPayload = Type.Object(
  {
    orderId: Type.String({ format: 'uuid' }),
    orderTotal: Money,
  },
  { additionalProperties: false },
);
export type AuthorizationRevisedPayload = Static<typeof AuthorizationRevisedPayload>;
