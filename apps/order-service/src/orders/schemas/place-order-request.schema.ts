import { Address } from '@ftgo/contracts';
import { Type, type Static } from 'typebox';

import { LineItemRequest } from './line-item-request.schema.js';

export const PlaceOrderRequest = Type.Object(
  {
    restaurantId: Type.String({ format: 'uuid' }),
    deliveryAddress: Address,
    deliveryTime: Type.String({ format: 'date-time', maxLength: 40 }),
    lineItems: Type.Array(LineItemRequest, { minItems: 1, maxItems: 50 }),
  },
  { additionalProperties: false },
);
export type PlaceOrderRequest = Static<typeof PlaceOrderRequest>;
