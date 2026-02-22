import { Module } from '@nestjs/common';

import { AccountCommandsController } from './account-commands.controller.js';
import { AccountsController } from './accounts.controller.js';
import { Accounts } from './accounts.js';
import { AccountsService } from './accounts.service.js';
import { ConsumerEventsController } from './consumer-events.controller.js';
import { PostgresAccounts } from './postgres-accounts.js';

@Module({
  controllers: [AccountsController],
  providers: [
    AccountsService,
    ConsumerEventsController,
    AccountCommandsController,
    { provide: Accounts, useClass: PostgresAccounts },
  ],
})
export class AccountsModule {}
