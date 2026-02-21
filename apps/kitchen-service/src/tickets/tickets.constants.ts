import { TicketState } from './entities/ticket-state.js';

export const MAX_LINE_ITEMS = 50;
export const MAX_LINE_ITEM_QUANTITY = 100;
export const MENU_ITEM_NAME_MAX_LENGTH = 100;
export const TICKET_STATES: ReadonlyMap<string, TicketState> = new Map(
  Object.values(TicketState).map((state) => [state, state]),
);
export const LOCKABLE_TICKET_STATES: ReadonlySet<TicketState> = new Set([
  TicketState.AwaitingAcceptance,
  TicketState.Accepted,
]);
