import type { TokenPair } from '../tokens/token-pair.js';

export class TokenResponse {
  public readonly tokenType = 'Bearer';
  public readonly accessToken: string;
  public readonly accessTokenExpiresAt: string;
  public readonly refreshToken: string;
  public readonly refreshTokenExpiresAt: string;

  public constructor(tokens: TokenPair) {
    this.accessToken = tokens.accessToken.value;
    this.accessTokenExpiresAt = tokens.accessToken.expiresAt.toISOString();
    this.refreshToken = tokens.refreshToken;
    this.refreshTokenExpiresAt = tokens.refreshTokenExpiresAt.toISOString();
  }
}
