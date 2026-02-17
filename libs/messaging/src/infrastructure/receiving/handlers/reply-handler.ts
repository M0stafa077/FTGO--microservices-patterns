import type { IncomingMessage } from '../../../envelope/incoming-message.js';
import type { OutgoingMessage } from '../../../envelope/outgoing-message.js';
import { ANY_MESSAGE_TYPE } from '../../infrastructure.constants.js';
import type { Delivery } from '../delivery.js';
import type { ReplyReceiver } from '../reply-receiver.js';

import { MessageDecoder } from './message-decoder.js';
import type { MessageHandler } from './message-handler.js';
import type { Rejection } from './rejection.js';
import { ReplyHeaders } from './schemas/reply-headers.schema.js';
import { ReplyPayload } from './schemas/reply-payload.schema.js';

export class ReplyHandler implements MessageHandler {
  public readonly channel: string;
  public readonly type = ANY_MESSAGE_TYPE;
  private readonly decoder = new MessageDecoder(ReplyHeaders, ReplyPayload);

  public constructor(private readonly receiver: ReplyReceiver) {
    this.channel = receiver.channel;
  }

  public decode(delivery: Delivery): IncomingMessage<unknown> {
    return this.decoder.decode(delivery);
  }

  public async handle(message: IncomingMessage<unknown>): Promise<OutgoingMessage | undefined> {
    await this.receiver.receive(message);
    return undefined;
  }

  public rejectionOf(): Rejection | undefined {
    return undefined;
  }
}
