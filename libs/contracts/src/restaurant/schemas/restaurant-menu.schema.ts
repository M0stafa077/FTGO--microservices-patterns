import { Type, type Static } from 'typebox';

import { RestaurantMenuItem } from './restaurant-menu-item.schema.js';

export const RestaurantMenu = Type.Object(
  {
    items: Type.Array(RestaurantMenuItem, { minItems: 1, maxItems: 200 }),
  },
  { additionalProperties: false },
);
export type RestaurantMenu = Static<typeof RestaurantMenu>;
