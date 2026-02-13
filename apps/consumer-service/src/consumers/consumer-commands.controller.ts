import {
  ValidateOrderByConsumer,
  type ValidateOrderByConsumerPayload,
  type ValidateOrderByConsumerReplyPayload,
} from '@ftgo/contracts';
import { Reply, type IncomingMessage } from '@ftgo/messaging';
import { MessageController, OnCommand } from '@ftgo/messaging/infrastructure';
import { Injectable } from '@nestjs/common';

import { ConsumersService } from './consumers.service.js';
import { ConsumerId } from './entities/consumer-id.js';

@MessageController()
@Injectable()
export class ConsumerCommandsController {
  public constructor(private readonly consumersService: ConsumersService) {}

  @OnCommand(ValidateOrderByConsumer)
  public async validateOrder(
    command: IncomingMessage<ValidateOrderByConsumerPayload>,
  ): Promise<Reply<ValidateOrderByConsumerReplyPayload>> {
    await this.consumersService.validateOrder(ConsumerId.of(command.payload.consumerId));
    return Reply.success({});
  }
}
