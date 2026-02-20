import type { AccountAuthorized } from './account-authorized.js';
import type { AuthorizationReversed } from './authorization-reversed.js';
import type { AuthorizationRevised } from './authorization-revised.js';

export interface AccountEventTranslation<T> {
  accountAuthorized(event: AccountAuthorized): T;

  authorizationReversed(event: AuthorizationReversed): T;

  authorizationRevised(event: AuthorizationRevised): T;
}
