import { Address, Money, OrderLineItem } from '@ftgo/contracts';
import { Type, type Static } from 'typebox';

export const OrderView = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    state: Type.String({ minLength: 1, maxLength: 64 }),
    consumerId: Type.String({ format: 'uuid' }),
    restaurantId: Type.String({ format: 'uuid' }),
    restaurantName: Type.String({ minLength: 1, maxLength: 200 }),
    lineItems: Type.Array(OrderLineItem, { minItems: 1, maxItems: 100 }),
    orderTotal: Money,
    deliveryAddress: Address,
    deliveryTime: Type.String({ format: 'date-time' }),
    createdAt: Type.String({ format: 'date-time' }),
  },
  { additionalProperties: false },
);
export type OrderView = Static<typeof OrderView>;
