import { Unauthenticated } from '@ftgo/common';

export class RefreshTokenReused extends Unauthenticated {
  public constructor() {
    super(
      'auth.refresh_token_reused',
      'This refresh token was already used. The session has ended for safety. Sign in again.',
    );
  }
}
