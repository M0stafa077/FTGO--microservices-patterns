import type { IncomingMessage } from '../../envelope/incoming-message.js';

export interface ReplyReceiver {
  readonly channel: string;

  receive(reply: IncomingMessage<unknown>): Promise<void>;
}
export const ReplyReceiver = Symbol('ReplyReceiver');
