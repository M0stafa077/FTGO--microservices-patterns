import { Type, type Static } from 'typebox';

import { LineItemRequest } from './line-item-request.schema.js';

export const ReviseOrderRequest = Type.Object(
  {
    lineItems: Type.Array(LineItemRequest, { minItems: 1, maxItems: 50 }),
  },
  { additionalProperties: false },
);
export type ReviseOrderRequest = Static<typeof ReviseOrderRequest>;
