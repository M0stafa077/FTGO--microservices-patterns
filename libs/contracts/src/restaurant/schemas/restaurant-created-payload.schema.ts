import { Type, type Static } from 'typebox';

import { Address } from '../../schemas/address.schema.js';

import { RestaurantMenu } from './restaurant-menu.schema.js';

export const RestaurantCreatedPayload = Type.Object(
  {
    restaurantId: Type.String({ format: 'uuid' }),
    name: Type.String({ minLength: 1, maxLength: 100 }),
    address: Address,
    menu: RestaurantMenu,
  },
  { additionalProperties: false },
);
export type RestaurantCreatedPayload = Static<typeof RestaurantCreatedPayload>;
