import type { IncomingMessage } from '../../../envelope/incoming-message.js';
import type { OutgoingMessage } from '../../../envelope/outgoing-message.js';
import type { Delivery } from '../delivery.js';

import type { Rejection } from './rejection.js';

export interface MessageHandler {
  readonly channel: string;
  readonly type: string;

  decode(delivery: Delivery): IncomingMessage<unknown>;

  handle(message: IncomingMessage<unknown>): Promise<OutgoingMessage | undefined>;

  rejectionOf(message: IncomingMessage<unknown>, error: unknown): Rejection | undefined;
}
