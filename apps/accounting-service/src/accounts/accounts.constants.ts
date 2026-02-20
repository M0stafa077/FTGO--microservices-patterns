import { AccountEventType } from './account-event-type.js';

export const ACCOUNT_EVENTS_PRIMARY_KEY = 'account_events_pkey';
export const ACCOUNT_EVENT_TYPES: ReadonlyMap<string, AccountEventType> = new Map(
  Object.values(AccountEventType).map((type) => [type, type]),
);
