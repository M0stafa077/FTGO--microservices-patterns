import { Type, type Static } from 'typebox';

import { Money } from '../../schemas/money.schema.js';

export const ValidateOrderByConsumerPayload = Type.Object(
  {
    consumerId: Type.String({ format: 'uuid' }),
    orderId: Type.String({ format: 'uuid' }),
    orderTotal: Money,
  },
  { additionalProperties: false },
);
export type ValidateOrderByConsumerPayload = Static<typeof ValidateOrderByConsumerPayload>;
