import { Type, type Static } from 'typebox';

import { Money } from '../../schemas/money.schema.js';

export const RestaurantMenuItem = Type.Object(
  {
    id: Type.String({ pattern: '^[a-z0-9-]{1,64}$' }),
    name: Type.String({ minLength: 1, maxLength: 100 }),
    price: Money,
  },
  { additionalProperties: false },
);
export type RestaurantMenuItem = Static<typeof RestaurantMenuItem>;
