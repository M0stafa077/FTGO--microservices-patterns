import { Type, type Static } from 'typebox';

import { Money } from '../../schemas/money.schema.js';

export const OrderLineItem = Type.Object(
  {
    menuItemId: Type.String({ pattern: '^[a-z0-9-]{1,64}$' }),
    name: Type.String({ minLength: 1, maxLength: 100 }),
    price: Money,
    quantity: Type.Integer({ minimum: 1, maximum: 100 }),
  },
  { additionalProperties: false },
);
export type OrderLineItem = Static<typeof OrderLineItem>;
