import { Money } from '@ftgo/contracts';
import { Type, type Static } from 'typebox';

export const OrderCreationData = Type.Object(
  {
    orderId: Type.String({ format: 'uuid' }),
    consumerId: Type.String({ format: 'uuid' }),
    orderTotal: Money,
  },
  { additionalProperties: false },
);
export type OrderCreationData = Static<typeof OrderCreationData>;
