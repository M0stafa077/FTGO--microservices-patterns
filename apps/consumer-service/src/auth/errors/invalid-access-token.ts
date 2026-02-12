import { Unauthenticated } from '@ftgo/common';

export class InvalidAccessToken extends Unauthenticated {
  public constructor(options?: ErrorOptions) {
    super('auth.invalid_access_token', 'A valid bearer access token is required.', options);
  }
}
