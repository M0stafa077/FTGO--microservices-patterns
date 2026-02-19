import { Module } from '@nestjs/common';

import { AccountCommandsController } from './account-commands.controller.js';
import { Accounts } from './accounts.js';
import { AccountsService } from './accounts.service.js';
import { Authorizations } from './authorizations.js';
import { ConsumerEventsController } from './consumer-events.controller.js';
import { PostgresAccounts } from './postgres-accounts.js';
import { PostgresAuthorizations } from './postgres-authorizations.js';

@Module({
  providers: [
    AccountsService,
    ConsumerEventsController,
    AccountCommandsController,
    { provide: Accounts, useClass: PostgresAccounts },
    { provide: Authorizations, useClass: PostgresAuthorizations },
  ],
})
export class AccountsModule {}
