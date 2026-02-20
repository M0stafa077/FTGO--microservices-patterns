import { Money, RevisedLineItem } from '@ftgo/contracts';
import { Type, type Static } from 'typebox';

export const OrderRevisionData = Type.Object(
  {
    orderId: Type.String({ format: 'uuid' }),
    consumerId: Type.String({ format: 'uuid' }),
    revisedLineItems: Type.Array(RevisedLineItem, { minItems: 1, maxItems: 50 }),
    revisedOrderTotal: Money,
  },
  { additionalProperties: false },
);
export type OrderRevisionData = Static<typeof OrderRevisionData>;
