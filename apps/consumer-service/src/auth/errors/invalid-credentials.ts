import { Unauthenticated } from '@ftgo/common';

export class InvalidCredentials extends Unauthenticated {
  public constructor() {
    super('auth.invalid_credentials', 'The email address or password is incorrect.');
  }
}
