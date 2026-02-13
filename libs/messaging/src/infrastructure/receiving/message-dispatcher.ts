import { CorrelationScope } from '@ftgo/common/infrastructure';
import { Injectable, Logger } from '@nestjs/common';

import type { IncomingMessage } from '../../envelope/incoming-message.js';
import { InvalidMessage } from '../../errors/invalid-message.js';

import { DeliveryAttempts } from './delivery-attempts.js';
import type { Delivery } from './delivery.js';
import { Completed } from './dispositions/completed.js';
import type { Disposition } from './dispositions/disposition.js';
import { EffectivelyOnce } from './effectively-once.js';
import { FailureHandlings } from './failures/failure-handlings.js';
import { Failure } from './failures/failure.js';
import type { MessageHandler } from './handlers/message-handler.js';
import { MessageHandlers } from './message-handlers.js';

@Injectable()
export class MessageDispatcher {
  private readonly logger = new Logger(MessageDispatcher.name);
  private readonly attempts = new DeliveryAttempts();
  private readonly unknownTypes = new Set<string>();

  public constructor(
    private readonly handlers: MessageHandlers,
    private readonly effectivelyOnce: EffectivelyOnce,
    private readonly failures: FailureHandlings,
    private readonly correlation: CorrelationScope,
  ) {}

  public async dispatch(delivery: Delivery): Promise<Disposition> {
    const attempt = this.attempts.next(delivery);
    const disposition = await this.route(delivery, attempt);
    if (disposition.isFinal()) {
      this.attempts.forget(delivery);
    }
    return disposition;
  }

  private async route(delivery: Delivery, attempt: number): Promise<Disposition> {
    const { type } = delivery;
    if (type === undefined) {
      const error = new InvalidMessage('The message has no "type" header.');
      return this.settle(Failure.beforeHandling(delivery, error, attempt));
    }
    const handler = this.handlers.find(delivery.topic, type);
    if (handler === undefined) {
      return this.skip(delivery.topic, type);
    }
    return this.decodeAndHandle(handler, delivery, attempt);
  }

  private async decodeAndHandle(
    handler: MessageHandler,
    delivery: Delivery,
    attempt: number,
  ): Promise<Disposition> {
    let message: IncomingMessage<unknown>;
    try {
      message = handler.decode(delivery);
    } catch (error) {
      return this.settle(Failure.beforeHandling(delivery, error, attempt));
    }
    return this.correlation.run(message.correlationId, async () => {
      try {
        await this.effectivelyOnce.process(message, async () => handler.handle(message));
        return new Completed();
      } catch (error) {
        const rejection = handler.rejectionOf(message, error);
        return this.settle(Failure.whileHandling(delivery, error, attempt, rejection));
      }
    });
  }

  private async settle(failure: Failure): Promise<Disposition> {
    try {
      return await this.failures.for(failure.error).handle(failure);
    } catch (error) {
      return this.failures
        .whenHandlingFails()
        .handle(Failure.beforeHandling(failure.delivery, error, failure.attempt));
    }
  }

  private skip(topic: string, type: string): Disposition {
    if (!this.unknownTypes.has(type)) {
      this.unknownTypes.add(type);
      this.logger.warn({ topic, type }, 'no handler for this message type; skipping it');
    }
    return new Completed();
  }
}
