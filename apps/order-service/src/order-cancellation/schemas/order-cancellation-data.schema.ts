import { Money } from '@ftgo/contracts';
import { Type, type Static } from 'typebox';

export const OrderCancellationData = Type.Object(
  {
    orderId: Type.String({ format: 'uuid' }),
    consumerId: Type.String({ format: 'uuid' }),
    orderTotal: Money,
  },
  { additionalProperties: false },
);
export type OrderCancellationData = Static<typeof OrderCancellationData>;
