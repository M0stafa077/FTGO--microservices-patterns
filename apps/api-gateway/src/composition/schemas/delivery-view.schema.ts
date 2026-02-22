import { Address } from '@ftgo/contracts';
import { Type, type Static } from 'typebox';

export const DeliveryView = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    state: Type.String({ minLength: 1, maxLength: 64 }),
    restaurantId: Type.String({ format: 'uuid' }),
    pickupAddress: Address,
    deliveryAddress: Address,
    pickupTime: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
    deliveryTime: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
    courierId: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
  },
  { additionalProperties: false },
);
export type DeliveryView = Static<typeof DeliveryView>;
