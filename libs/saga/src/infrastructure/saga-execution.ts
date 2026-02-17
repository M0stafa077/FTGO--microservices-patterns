import { Clock, RuleViolation } from '@ftgo/common';
import { FailureReplyPayload } from '@ftgo/contracts';
import { HeaderName, Outbox, ReplyOutcome, type IncomingMessage } from '@ftgo/messaging';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Static, TSchema } from 'typebox';

import { InvalidSagaDefinition } from '../errors/invalid-saga-definition.js';
import type { PendingReply } from '../pending-reply.js';
import type { SagaAction } from '../saga-action.js';
import type { SagaDefinition } from '../saga-definition.js';
import type { SagaInstance } from '../saga-instance.js';

import { CompiledSchemaDecoder } from './compiled-schema-decoder.js';
import { REPLY_OUTCOMES, SAGA_REPLIES_SUFFIX } from './infrastructure.constants.js';
import { OutboxSagaCommands } from './outbox-saga-commands.js';
import { SagaOptions } from './saga-options.js';

@Injectable()
export class SagaExecution {
  private readonly logger = new Logger(SagaExecution.name);

  public constructor(
    @Inject(Outbox) private readonly outbox: Outbox,
    @Inject(Clock) private readonly clock: Clock,
    @Inject(SagaOptions) private readonly options: SagaOptions,
    private readonly decoder: CompiledSchemaDecoder,
  ) {}

  public async run<DataSchema extends TSchema>(
    definition: SagaDefinition<DataSchema>,
    instance: SagaInstance,
  ): Promise<void> {
    while (instance.isRunning()) {
      const step = definition.steps[instance.currentStep];
      if (step === undefined) {
        this.finish(instance);
        return;
      }
      const action = step.actionFor(instance.isCompensating);
      if (action === undefined) {
        instance.moveOn(this.clock.now());
        continue;
      }
      const pending = await this.perform(definition, instance, action);
      if (pending !== undefined) {
        instance.waitFor(pending.messageId, this.clock.now());
        this.log(instance, 'saga is waiting for a reply');
        return;
      }
    }
  }

  public async acceptReply<DataSchema extends TSchema>(
    definition: SagaDefinition<DataSchema>,
    instance: SagaInstance,
    reply: IncomingMessage<unknown>,
  ): Promise<void> {
    const step = definition.steps[instance.currentStep];
    const action = step?.actionFor(instance.isCompensating);
    if (step === undefined || action === undefined) {
      throw new InvalidSagaDefinition(
        definition.sagaType,
        `step ${String(instance.currentStep)} does not wait for a reply.`,
      );
    }
    if (REPLY_OUTCOMES.get(reply.headers.get(HeaderName.Outcome)) === ReplyOutcome.Success) {
      const data = this.decoder.decode(definition.data, instance.data);
      instance.replaceData(action.acceptReply(data, reply.payload, this.decoder), this.clock.now());
      instance.moveOn(this.clock.now());
    } else {
      const { reason } = this.decoder.decode(FailureReplyPayload, reply.payload);
      this.handleFailure(instance, reason, step.isRetriable);
    }
    await this.run(definition, instance);
  }

  private async perform<DataSchema extends TSchema>(
    definition: SagaDefinition<DataSchema>,
    instance: SagaInstance,
    action: SagaAction<Static<DataSchema>>,
  ): Promise<PendingReply | undefined> {
    const data = this.decoder.decode(definition.data, instance.data);
    try {
      const pending = await action.perform(data, this.commandsFor(instance));
      if (pending === undefined) {
        instance.moveOn(this.clock.now());
      }
      return pending;
    } catch (error) {
      if (!(error instanceof RuleViolation)) {
        throw error;
      }
      this.handleFailure(instance, error.code, false);
      return undefined;
    }
  }

  private handleFailure(instance: SagaInstance, reason: string, isRetriable: boolean): void {
    if (instance.isCompensating || isRetriable) {
      instance.fail(reason, this.clock.now());
      this.logger.error(this.fieldsOf(instance, reason), 'saga failed and needs an operator');
      return;
    }
    instance.startCompensating(this.clock.now());
    this.log(instance, `saga is compensating after "${reason}"`);
  }

  private finish(instance: SagaInstance): void {
    if (instance.isCompensating) {
      instance.finishCompensation(this.clock.now());
      this.log(instance, 'saga compensated');
      return;
    }
    instance.complete(this.clock.now());
    this.log(instance, 'saga completed');
  }

  private commandsFor(instance: SagaInstance): OutboxSagaCommands {
    return new OutboxSagaCommands(this.outbox, {
      sagaType: instance.sagaType,
      sagaId: instance.id.toString(),
      replyTo: `${this.options.serviceName}${SAGA_REPLIES_SUFFIX}`,
    });
  }

  private log(instance: SagaInstance, message: string): void {
    this.logger.log(this.fieldsOf(instance), message);
  }

  private fieldsOf(instance: SagaInstance, reason?: string): Record<string, unknown> {
    return {
      sagaType: instance.sagaType,
      sagaId: instance.id.toString(),
      step: instance.currentStep,
      isCompensating: instance.isCompensating,
      ...(reason === undefined ? {} : { reason }),
    };
  }
}
