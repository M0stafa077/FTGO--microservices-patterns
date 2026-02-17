import type { SagaAction } from './saga-action.js';

export class SagaStep<Data> {
  private constructor(
    public readonly action: SagaAction<Data> | undefined,
    public readonly compensation: SagaAction<Data> | undefined,
    public readonly isRetriable: boolean,
  ) {}

  public static invoke<Data>(action: SagaAction<Data>): SagaStep<Data> {
    return new SagaStep(action, undefined, false);
  }

  public static compensateWith<Data>(compensation: SagaAction<Data>): SagaStep<Data> {
    return new SagaStep(undefined, compensation, false);
  }

  public withCompensation(compensation: SagaAction<Data>): SagaStep<Data> {
    return new SagaStep(this.action, compensation, this.isRetriable);
  }

  public retriable(): SagaStep<Data> {
    return new SagaStep(this.action, this.compensation, true);
  }

  public actionFor(isCompensating: boolean): SagaAction<Data> | undefined {
    return isCompensating ? this.compensation : this.action;
  }
}
