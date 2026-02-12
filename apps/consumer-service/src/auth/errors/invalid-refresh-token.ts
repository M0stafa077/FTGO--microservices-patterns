import { Unauthenticated } from '@ftgo/common';

export class InvalidRefreshToken extends Unauthenticated {
  public constructor() {
    super('auth.invalid_refresh_token', 'The refresh token is not valid. Sign in again.');
  }
}
