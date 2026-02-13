import type { IncomingMessage } from '../../../envelope/incoming-message.js';
import type { OutgoingMessage } from '../../../envelope/outgoing-message.js';

export interface Rejection {
  readonly message: IncomingMessage<unknown>;
  readonly reply: OutgoingMessage;
}
