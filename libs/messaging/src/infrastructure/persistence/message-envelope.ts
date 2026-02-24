import type { MessageHeaders } from '../../envelope/message-headers.js';

export interface MessageEnvelope {
  readonly messageId: string;
  readonly createdAt: Date;
  readonly correlationId: string;
  readonly traceHeaders: MessageHeaders;
}
