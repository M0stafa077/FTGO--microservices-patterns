import type { Principal } from '../principal.js';

import type { AccessToken } from './access-token.js';

export interface AccessTokens {
  issue(principal: Principal): Promise<AccessToken>;

  verify(token: string): Promise<Principal>;
}
export const AccessTokens = Symbol('AccessTokens');
