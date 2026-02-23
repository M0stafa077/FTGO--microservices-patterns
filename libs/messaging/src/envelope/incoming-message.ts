import { HeaderName } from './header-name.js';
import type { MessageHeaders } from './message-headers.js';

export class IncomingMessage<Payload> {
  public constructor(
    public readonly headers: MessageHeaders,
    public readonly payload: Payload,
  ) {}

  public get messageId(): string {
    return this.headers.get(HeaderName.MessageId);
  }

  public get type(): string {
    return this.headers.get(HeaderName.Type);
  }

  public get correlationId(): string {
    return this.headers.get(HeaderName.CorrelationId);
  }

  public get timestamp(): Date {
    return new Date(this.headers.get(HeaderName.Timestamp));
  }
}
