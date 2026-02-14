import { Type, type Static } from 'typebox';

import { RestaurantMenu } from './restaurant-menu.schema.js';

export const RestaurantMenuRevisedPayload = Type.Object(
  {
    restaurantId: Type.String({ format: 'uuid' }),
    menu: RestaurantMenu,
  },
  { additionalProperties: false },
);
export type RestaurantMenuRevisedPayload = Static<typeof RestaurantMenuRevisedPayload>;
