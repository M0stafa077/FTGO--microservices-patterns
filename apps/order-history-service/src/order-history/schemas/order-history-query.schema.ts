import { Type, type Static } from 'typebox';

import { OrderState } from '../entities/order-state.js';
import {
  MAX_KEYWORD_LENGTH,
  MAX_PAGE_TOKEN_LENGTH,
  PAGE_SIZE_FORMAT,
} from '../order-history.constants.js';

export const OrderHistoryQuery = Type.Object(
  {
    consumerId: Type.String({ format: 'uuid' }),
    state: Type.Optional(Type.Enum(OrderState)),
    keyword: Type.Optional(Type.String({ minLength: 1, maxLength: MAX_KEYWORD_LENGTH })),
    since: Type.Optional(Type.String({ format: 'date-time' })),
    pageSize: Type.Optional(Type.String({ pattern: PAGE_SIZE_FORMAT })),
    pageToken: Type.Optional(
      Type.String({ minLength: 1, maxLength: MAX_PAGE_TOKEN_LENGTH, pattern: '^[A-Za-z0-9_-]+$' }),
    ),
  },
  { additionalProperties: false },
);
export type OrderHistoryQuery = Static<typeof OrderHistoryQuery>;
