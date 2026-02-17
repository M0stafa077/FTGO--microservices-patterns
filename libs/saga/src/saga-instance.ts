import { Uuid } from '@ftgo/common';

import { SagaAlreadyEnded } from './errors/saga-already-ended.js';
import type { SagaInstanceState } from './saga-instance-state.js';
import { SagaStatus } from './saga-status.js';

export class SagaInstance {
  private constructor(private state: SagaInstanceState) {}

  public get id(): Uuid {
    return this.state.id;
  }

  public get sagaType(): string {
    return this.state.sagaType;
  }

  public get currentStep(): number {
    return this.state.currentStep;
  }

  public get isCompensating(): boolean {
    return this.state.isCompensating;
  }

  public get data(): unknown {
    return this.state.data;
  }

  public static begin(sagaType: string, data: unknown, now: Date): SagaInstance {
    return new SagaInstance({
      id: Uuid.generate(),
      sagaType,
      status: SagaStatus.Running,
      currentStep: 0,
      isCompensating: false,
      data,
      awaitedMessageId: undefined,
      failureReason: undefined,
      createdAt: now,
      updatedAt: now,
      version: 0,
    });
  }

  public static restore(state: SagaInstanceState): SagaInstance {
    return new SagaInstance(state);
  }

  public snapshot(): SagaInstanceState {
    return this.state;
  }

  public isRunning(): boolean {
    return this.state.status === SagaStatus.Running;
  }

  public isWaitingFor(messageId: string): boolean {
    return this.isRunning() && this.state.awaitedMessageId === messageId;
  }

  public waitFor(messageId: string, now: Date): void {
    this.change({ awaitedMessageId: messageId }, now);
  }

  public replaceData(data: unknown, now: Date): void {
    this.change({ data }, now);
  }

  public moveOn(now: Date): void {
    const direction = this.state.isCompensating ? -1 : 1;
    this.change(
      { currentStep: this.state.currentStep + direction, awaitedMessageId: undefined },
      now,
    );
  }

  public startCompensating(now: Date): void {
    this.change(
      {
        isCompensating: true,
        currentStep: this.state.currentStep - 1,
        awaitedMessageId: undefined,
      },
      now,
    );
  }

  public complete(now: Date): void {
    this.end(SagaStatus.Completed, undefined, now);
  }

  public finishCompensation(now: Date): void {
    this.end(SagaStatus.Compensated, undefined, now);
  }

  public fail(reason: string, now: Date): void {
    this.end(SagaStatus.Failed, reason, now);
  }

  private end(status: SagaStatus, failureReason: string | undefined, now: Date): void {
    this.change({ status, failureReason, awaitedMessageId: undefined }, now);
  }

  private change(changes: Partial<SagaInstanceState>, now: Date): void {
    if (!this.isRunning()) {
      throw new SagaAlreadyEnded(this.state.id, this.state.status);
    }
    this.state = { ...this.state, ...changes, updatedAt: now };
  }
}
