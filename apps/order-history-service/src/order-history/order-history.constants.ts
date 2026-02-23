import { OrderState } from './entities/order-state.js';

export const WORD_SEPARATOR = /[^\p{L}\p{N}]+/u;
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_FORMAT = '^([1-9]|[1-4][0-9]|50)$';
export const MAX_KEYWORD_LENGTH = 100;
export const MAX_PAGE_TOKEN_LENGTH = 200;
export const ORDER_STATES: ReadonlyMap<string, OrderState> = new Map(
  Object.values(OrderState).map((state) => [state, state]),
);
