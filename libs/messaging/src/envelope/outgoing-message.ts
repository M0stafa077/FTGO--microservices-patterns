import { FailureReplyPayload, type CommandDefinition, type EventDefinition } from '@ftgo/contracts';
import type { Static, TSchema } from 'typebox';

import type { Reply } from '../replies/reply.js';

import { HeaderName } from './header-name.js';
import type { IncomingMessage } from './incoming-message.js';
import { MessageHeaders } from './message-headers.js';

export class OutgoingMessage {
  private constructor(
    public readonly channel: string,
    public readonly key: string,
    public readonly headers: MessageHeaders,
    public readonly payload: unknown,
    public readonly schema: TSchema,
  ) {}

  public static event<Payload extends TSchema>(
    definition: EventDefinition<Payload>,
    aggregateId: string,
    payload: Static<Payload>,
  ): OutgoingMessage {
    const headers = MessageHeaders.empty()
      .with(HeaderName.Type, definition.type)
      .with(HeaderName.AggregateType, definition.aggregateType)
      .with(HeaderName.AggregateId, aggregateId);
    return new OutgoingMessage(
      definition.channel,
      aggregateId,
      headers,
      payload,
      definition.payload,
    );
  }

  public static reply<SuccessPayload extends TSchema>(
    command: IncomingMessage<unknown>,
    definition: CommandDefinition<TSchema, SuccessPayload>,
    reply: Reply<Static<SuccessPayload>>,
  ): OutgoingMessage {
    const sagaId = command.headers.get(HeaderName.SagaId);
    const headers = MessageHeaders.empty()
      .with(HeaderName.Type, definition.reply.type)
      .with(HeaderName.SagaType, command.headers.get(HeaderName.SagaType))
      .with(HeaderName.SagaId, sagaId)
      .with(HeaderName.InReplyTo, command.messageId)
      .with(HeaderName.Outcome, reply.outcome);
    const schema = reply.isSuccess() ? definition.reply.payload : FailureReplyPayload;
    return new OutgoingMessage(
      command.headers.get(HeaderName.ReplyTo),
      sagaId,
      headers,
      reply.payload,
      schema,
    );
  }
}
