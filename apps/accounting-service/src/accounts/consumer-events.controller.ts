import { ConsumerCreated, type ConsumerCreatedPayload } from '@ftgo/contracts';
import type { IncomingMessage } from '@ftgo/messaging';
import { MessageController, OnEvent } from '@ftgo/messaging/infrastructure';
import { Injectable } from '@nestjs/common';

import { AccountsService } from './accounts.service.js';
import { AccountId } from './entities/account-id.js';

@MessageController()
@Injectable()
export class ConsumerEventsController {
  public constructor(private readonly accountsService: AccountsService) {}

  @OnEvent(ConsumerCreated)
  public async consumerCreated(event: IncomingMessage<ConsumerCreatedPayload>): Promise<void> {
    await this.accountsService.openAccount(AccountId.of(event.payload.consumerId));
  }
}
