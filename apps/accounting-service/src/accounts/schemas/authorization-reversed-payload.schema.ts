import { Type, type Static } from 'typebox';

export const AuthorizationReversedPayload = Type.Object(
  {
    orderId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
export type AuthorizationReversedPayload = Static<typeof AuthorizationReversedPayload>;
