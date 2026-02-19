import { Currency, Money } from '@ftgo/common';
import { Authorize, type AuthorizePayload, type AuthorizeReplyPayload } from '@ftgo/contracts';
import { Reply, type IncomingMessage } from '@ftgo/messaging';
import { MessageController, OnCommand } from '@ftgo/messaging/infrastructure';
import { Injectable } from '@nestjs/common';

import { AccountsService } from './accounts.service.js';
import { AccountId } from './entities/account-id.js';
import { OrderId } from './entities/order-id.js';

@MessageController()
@Injectable()
export class AccountCommandsController {
  public constructor(private readonly accountsService: AccountsService) {}

  @OnCommand(Authorize)
  public async authorize(
    command: IncomingMessage<AuthorizePayload>,
  ): Promise<Reply<AuthorizeReplyPayload>> {
    const { consumerId, orderId, orderTotal } = command.payload;
    await this.accountsService.authorize(
      AccountId.of(consumerId),
      OrderId.of(orderId),
      Money.of(orderTotal.amount, Currency.of(orderTotal.currency)),
    );
    return Reply.success({});
  }
}
