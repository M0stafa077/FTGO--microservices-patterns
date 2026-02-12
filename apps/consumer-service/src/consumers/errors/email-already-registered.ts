import { Conflict } from '@ftgo/common';

export class EmailAlreadyRegistered extends Conflict {
  public constructor() {
    super(
      'consumer.email_already_registered',
      'A consumer with this email address already exists.',
    );
  }
}
