import type { AccessToken } from './access-token.js';

export interface TokenPair {
  readonly accessToken: AccessToken;
  readonly refreshToken: string;
  readonly refreshTokenExpiresAt: Date;
}
