import { FtgoError } from '@ftgo/common';
import type { CommandDefinition } from '@ftgo/contracts';
import type { TSchema } from 'typebox';

import type { IncomingMessage } from '../../../envelope/incoming-message.js';
import { OutgoingMessage } from '../../../envelope/outgoing-message.js';
import { InvalidMessageHandler } from '../../../errors/invalid-message-handler.js';
import { Reply } from '../../../replies/reply.js';
import { UNKNOWN_FAILURE_REASON } from '../../infrastructure.constants.js';
import type { Delivery } from '../delivery.js';

import type { HandlerMethod } from './handler-method.js';
import { MessageDecoder } from './message-decoder.js';
import type { MessageHandler } from './message-handler.js';
import type { Rejection } from './rejection.js';
import { CommandHeaders } from './schemas/command-headers.schema.js';

export class CommandHandler implements MessageHandler {
  public readonly channel: string;
  public readonly type: string;
  private readonly decoder: MessageDecoder;

  public constructor(
    private readonly definition: CommandDefinition<TSchema, TSchema>,
    private readonly method: HandlerMethod,
  ) {
    this.channel = definition.channel;
    this.type = definition.type;
    this.decoder = new MessageDecoder(CommandHeaders, definition.payload);
  }

  public decode(delivery: Delivery): IncomingMessage<unknown> {
    return this.decoder.decode(delivery);
  }

  public async handle(message: IncomingMessage<unknown>): Promise<OutgoingMessage | undefined> {
    const reply = await this.method.invoke(message);
    if (!Reply.isReply(reply)) {
      throw new InvalidMessageHandler(
        `Command handler ${this.method.toString()} returned no Reply.`,
      );
    }
    return OutgoingMessage.reply(message, this.definition, reply);
  }

  public rejectionOf(message: IncomingMessage<unknown>, error: unknown): Rejection | undefined {
    const reason = error instanceof FtgoError ? error.code : UNKNOWN_FAILURE_REASON;
    return {
      message,
      reply: OutgoingMessage.reply(message, this.definition, Reply.failure(reason)),
    };
  }
}
