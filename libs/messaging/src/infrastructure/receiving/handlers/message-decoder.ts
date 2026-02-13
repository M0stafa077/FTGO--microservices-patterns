import { CompiledSchema } from '@ftgo/common/infrastructure';
import type { TSchema } from 'typebox';

import { IncomingMessage } from '../../../envelope/incoming-message.js';
import { MessageHeaders } from '../../../envelope/message-headers.js';
import { InvalidMessage } from '../../../errors/invalid-message.js';
import type { Delivery } from '../delivery.js';

export class MessageDecoder {
  private readonly headers: CompiledSchema<TSchema>;
  private readonly payload: CompiledSchema<TSchema>;

  public constructor(headersSchema: TSchema, payloadSchema: TSchema) {
    this.headers = new CompiledSchema(headersSchema);
    this.payload = new CompiledSchema(payloadSchema);
  }

  public decode(delivery: Delivery): IncomingMessage<unknown> {
    const headers = MessageHeaders.from(delivery.headers);
    this.headers.parse(headers.toRecord(), 'message.invalid', 'The message envelope is not valid.');
    const payload: unknown = this.parseJson(delivery.value);
    this.payload.parse(payload, 'message.invalid', 'The message payload is not valid.');
    return new IncomingMessage(headers, payload);
  }

  private parseJson(value: string | null): unknown {
    if (value === null) {
      throw new InvalidMessage('The message has no payload.');
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new InvalidMessage('The message payload is not valid JSON.', [], { cause: error });
    }
  }
}
