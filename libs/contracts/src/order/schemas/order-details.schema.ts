import { Type, type Static } from 'typebox';

import { Money } from '../../schemas/money.schema.js';

import { OrderLineItem } from './order-line-item.schema.js';

export const OrderDetails = Type.Object(
  {
    consumerId: Type.String({ format: 'uuid' }),
    restaurantId: Type.String({ format: 'uuid' }),
    lineItems: Type.Array(OrderLineItem, { minItems: 1, maxItems: 50 }),
    orderTotal: Money,
  },
  { additionalProperties: false },
);
export type OrderDetails = Static<typeof OrderDetails>;
