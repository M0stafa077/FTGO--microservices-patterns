import { Money } from '@ftgo/contracts';
import { Type, type Static } from 'typebox';

export const AccountAuthorizedPayload = Type.Object(
  {
    orderId: Type.String({ format: 'uuid' }),
    orderTotal: Money,
  },
  { additionalProperties: false },
);
export type AccountAuthorizedPayload = Static<typeof AccountAuthorizedPayload>;
