import { ResourceNotFound } from '@ftgo/common';

import type { AccountId } from '../entities/account-id.js';

export class AccountNotFound extends ResourceNotFound {
  public constructor(id: AccountId) {
    super('account.not_found', `Account ${id.toString()} does not exist.`);
  }
}
