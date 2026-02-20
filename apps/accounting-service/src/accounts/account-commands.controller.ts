import { Currency, Money } from '@ftgo/common';
import {
  Authorize,
  ReverseAuthorization,
  ReviseAuthorization,
  type AuthorizationPayload,
  type AuthorizationReplyPayload,
} from '@ftgo/contracts';
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
    command: IncomingMessage<AuthorizationPayload>,
  ): Promise<Reply<AuthorizationReplyPayload>> {
    const { consumerId, orderId, orderTotal } = command.payload;
    await this.accountsService.authorize(
      AccountId.of(consumerId),
      OrderId.of(orderId),
      this.moneyOf(orderTotal),
    );
    return Reply.success({});
  }

  @OnCommand(ReverseAuthorization)
  public async reverseAuthorization(
    command: IncomingMessage<AuthorizationPayload>,
  ): Promise<Reply<AuthorizationReplyPayload>> {
    const { consumerId, orderId, orderTotal } = command.payload;
    await this.accountsService.reverseAuthorization(
      AccountId.of(consumerId),
      OrderId.of(orderId),
      this.moneyOf(orderTotal),
    );
    return Reply.success({});
  }

  @OnCommand(ReviseAuthorization)
  public async reviseAuthorization(
    command: IncomingMessage<AuthorizationPayload>,
  ): Promise<Reply<AuthorizationReplyPayload>> {
    const { consumerId, orderId, orderTotal } = command.payload;
    await this.accountsService.reviseAuthorization(
      AccountId.of(consumerId),
      OrderId.of(orderId),
      this.moneyOf(orderTotal),
    );
    return Reply.success({});
  }

  private moneyOf(total: AuthorizationPayload['orderTotal']): Money {
    return Money.of(total.amount, Currency.of(total.currency));
  }
}
