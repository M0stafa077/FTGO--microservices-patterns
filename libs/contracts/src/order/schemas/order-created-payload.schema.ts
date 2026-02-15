import { Type, type Static } from 'typebox';

import { Address } from '../../schemas/address.schema.js';

import { OrderDetails } from './order-details.schema.js';

export const OrderCreatedPayload = Type.Object(
  {
    orderId: Type.String({ format: 'uuid' }),
    orderDetails: OrderDetails,
    deliveryAddress: Address,
    restaurantName: Type.String({ minLength: 1, maxLength: 100 }),
  },
  { additionalProperties: false },
);
export type OrderCreatedPayload = Static<typeof OrderCreatedPayload>;
