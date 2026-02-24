import { CORRELATION_ID_ATTRIBUTE } from '@ftgo/common/infrastructure';
import { Injectable } from '@nestjs/common';
import {
  context,
  propagation,
  ROOT_CONTEXT,
  SpanKind,
  SpanStatusCode,
  trace,
  type Attributes,
  type Span,
} from '@opentelemetry/api';

import { HeaderName } from '../../envelope/header-name.js';
import { MessageHeaders } from '../../envelope/message-headers.js';
import type { OutgoingMessage } from '../../envelope/outgoing-message.js';
import type { BrokerMessage } from '../broker/broker-message.js';
import {
  ATTR_FAILURE_CODE,
  ATTR_MESSAGE_TYPE,
  ATTR_MESSAGING_DESTINATION_NAME,
  ATTR_MESSAGING_KAFKA_OFFSET,
  ATTR_MESSAGING_MESSAGE_ID,
  ATTR_MESSAGING_OPERATION_TYPE,
  ATTR_MESSAGING_PARTITION_ID,
  ATTR_MESSAGING_SYSTEM,
  MESSAGING_SYSTEM,
  TRACER_NAME,
} from '../infrastructure.constants.js';
import type { Delivery } from '../receiving/delivery.js';
import type { Failure } from '../receiving/failures/failure.js';

import { MessagingOperation } from './messaging-operation.js';

@Injectable()
export class MessageTracing {
  private readonly tracer = trace.getTracer(TRACER_NAME);

  public created(
    message: OutgoingMessage,
    messageId: string,
    correlationId: string,
  ): MessageHeaders {
    const span = this.tracer.startSpan(`${MessagingOperation.Create} ${message.channel}`, {
      kind: SpanKind.PRODUCER,
      attributes: {
        ...this.attributesOf(MessagingOperation.Create, message.channel, messageId),
        [ATTR_MESSAGE_TYPE]: message.headers.get(HeaderName.Type),
        [CORRELATION_ID_ATTRIBUTE]: correlationId,
      },
    });
    const carrier: Record<string, string> = {};
    propagation.inject(trace.setSpan(context.active(), span), carrier);
    span.end();
    return MessageHeaders.from(carrier);
  }

  public async sending(
    messages: ReadonlyArray<BrokerMessage>,
    work: () => Promise<void>,
  ): Promise<void> {
    const spans = messages.map((message) => this.sendSpanOf(message));
    try {
      await work();
    } catch (error) {
      spans.forEach((span) => {
        this.markFailed(span, error, 'Kafka did not acknowledge the message.');
      });
      throw error;
    } finally {
      spans.forEach((span) => {
        span.end();
      });
    }
  }

  public async processing<T>(delivery: Delivery, work: () => Promise<T>): Promise<T> {
    const parent = propagation.extract(ROOT_CONTEXT, delivery.headers);
    const span = this.tracer.startSpan(
      `${MessagingOperation.Process} ${delivery.topic}`,
      { kind: SpanKind.CONSUMER, attributes: this.processAttributesOf(delivery) },
      parent,
    );
    try {
      return await context.with(trace.setSpan(parent, span), work);
    } catch (error) {
      this.markFailed(span, error, 'The message could not be processed.');
      throw error;
    } finally {
      span.end();
    }
  }

  public failed(failure: Failure): void {
    const span = trace.getActiveSpan();
    if (span === undefined) {
      return;
    }
    this.markFailed(span, failure.error, failure.description);
    span.setAttribute(ATTR_FAILURE_CODE, failure.code);
  }

  private sendSpanOf(message: BrokerMessage): Span {
    return this.tracer.startSpan(
      `${MessagingOperation.Send} ${message.topic}`,
      {
        kind: SpanKind.PRODUCER,
        attributes: {
          ...this.attributesOf(
            MessagingOperation.Send,
            message.topic,
            message.headers[HeaderName.MessageId],
          ),
          [ATTR_MESSAGE_TYPE]: message.headers[HeaderName.Type],
        },
      },
      propagation.extract(ROOT_CONTEXT, message.headers),
    );
  }

  private processAttributesOf(delivery: Delivery): Attributes {
    const { headers, position } = delivery;
    return {
      ...this.attributesOf(
        MessagingOperation.Process,
        position.topic,
        headers[HeaderName.MessageId],
      ),
      [ATTR_MESSAGING_PARTITION_ID]: String(position.partition),
      [ATTR_MESSAGING_KAFKA_OFFSET]: position.offset,
      [ATTR_MESSAGE_TYPE]: delivery.type,
      [CORRELATION_ID_ATTRIBUTE]: headers[HeaderName.CorrelationId],
    };
  }

  private attributesOf(
    operation: MessagingOperation,
    topic: string,
    messageId: string | undefined,
  ): Attributes {
    return {
      [ATTR_MESSAGING_SYSTEM]: MESSAGING_SYSTEM,
      [ATTR_MESSAGING_OPERATION_TYPE]: operation,
      [ATTR_MESSAGING_DESTINATION_NAME]: topic,
      [ATTR_MESSAGING_MESSAGE_ID]: messageId,
    };
  }

  private markFailed(span: Span, error: unknown, description: string): void {
    span.recordException(error instanceof Error ? error : description);
    span.setStatus({ code: SpanStatusCode.ERROR, message: description });
  }
}
