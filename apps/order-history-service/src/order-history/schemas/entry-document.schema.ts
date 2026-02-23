import { Money } from '@ftgo/contracts';
import { Type, type Static } from 'typebox';

import { HistoryLineItemDocument } from './history-line-item-document.schema.js';

export const EntryDocument = Type.Object(
  {
    restaurantId: Type.String({ format: 'uuid' }),
    restaurantName: Type.String({ minLength: 1, maxLength: 100 }),
    lineItems: Type.Array(HistoryLineItemDocument, { minItems: 1, maxItems: 50 }),
    orderTotal: Money,
  },
  { additionalProperties: false },
);
export type EntryDocument = Static<typeof EntryDocument>;
