import { OrderState } from './entities/order-state.js';

export const MAX_LINE_ITEMS = 50;
export const MAX_LINE_ITEM_QUANTITY = 100;
export const ORDER_STATES: ReadonlyMap<string, OrderState> = new Map(
  Object.values(OrderState).map((state) => [state, state]),
);
