import type { EventDefinition } from '@ftgo/contracts';
import type { TSchema } from 'typebox';

import type { IncomingMessage } from '../../../envelope/incoming-message.js';
import type { OutgoingMessage } from '../../../envelope/outgoing-message.js';
import type { Delivery } from '../delivery.js';

import type { HandlerMethod } from './handler-method.js';
import { MessageDecoder } from './message-decoder.js';
import type { MessageHandler } from './message-handler.js';
import type { Rejection } from './rejection.js';
import { EventHeaders } from './schemas/event-headers.schema.js';

export class EventHandler implements MessageHandler {
  public readonly channel: string;
  public readonly type: string;
  private readonly decoder: MessageDecoder;

  public constructor(
    definition: EventDefinition<TSchema>,
    private readonly method: HandlerMethod,
  ) {
    this.channel = definition.channel;
    this.type = definition.type;
    this.decoder = new MessageDecoder(EventHeaders, definition.payload);
  }

  public decode(delivery: Delivery): IncomingMessage<unknown> {
    return this.decoder.decode(delivery);
  }

  public async handle(message: IncomingMessage<unknown>): Promise<OutgoingMessage | undefined> {
    await this.method.invoke(message);
    return undefined;
  }

  public rejectionOf(): Rejection | undefined {
    return undefined;
  }
}
