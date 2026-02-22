import { Money } from '@ftgo/contracts';
import { Type, type Static } from 'typebox';

export const AuthorizationView = Type.Object(
  {
    orderId: Type.String({ format: 'uuid' }),
    amount: Money,
    isReversed: Type.Boolean(),
  },
  { additionalProperties: false },
);
export type AuthorizationView = Static<typeof AuthorizationView>;
