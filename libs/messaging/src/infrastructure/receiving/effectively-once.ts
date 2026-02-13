import { Transactions } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import type { IncomingMessage } from '../../envelope/incoming-message.js';
import type { OutgoingMessage } from '../../envelope/outgoing-message.js';
import { Outbox } from '../../outbox.js';
import { MessagingOptions } from '../messaging-options.js';
import { ProcessedMessages } from '../persistence/processed-messages.js';

@Injectable()
export class EffectivelyOnce {
  public constructor(
    @Inject(Transactions) private readonly transactions: Transactions,
    @Inject(ProcessedMessages) private readonly processedMessages: ProcessedMessages,
    @Inject(Outbox) private readonly outbox: Outbox,
    @Inject(MessagingOptions) private readonly options: MessagingOptions,
  ) {}

  public async process(
    message: IncomingMessage<unknown>,
    work: () => Promise<OutgoingMessage | undefined>,
  ): Promise<void> {
    await this.transactions.run(async () => {
      const isFirstDelivery = await this.processedMessages.markProcessed(
        this.options.serviceName,
        message.messageId,
      );
      if (!isFirstDelivery) {
        return;
      }
      const reply = await work();
      if (reply !== undefined) {
        await this.outbox.append(reply);
      }
    });
  }
}
