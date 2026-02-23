import { Money } from '@ftgo/contracts';
import { Type, type Static } from 'typebox';

export const HistoryLineItemDocument = Type.Object(
  {
    menuItemId: Type.String({ minLength: 1, maxLength: 64 }),
    name: Type.String({ minLength: 1, maxLength: 100 }),
    price: Money,
    quantity: Type.Integer({ minimum: 1, maximum: 100 }),
  },
  { additionalProperties: false },
);
export type HistoryLineItemDocument = Static<typeof HistoryLineItemDocument>;
