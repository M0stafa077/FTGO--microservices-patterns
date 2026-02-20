import type { AccountEventTranslation } from './account-event-translation.js';

export interface AccountEvent {
  translate<T>(translation: AccountEventTranslation<T>): T;
}
