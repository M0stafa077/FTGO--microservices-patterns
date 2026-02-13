import { AsyncLocalStorage } from 'node:async_hooks';

export class CorrelationScope {
  private readonly storage = new AsyncLocalStorage<string>();

  public current(): string | undefined {
    return this.storage.getStore();
  }

  public run<T>(correlationId: string, work: () => T): T {
    return this.storage.run(correlationId, work);
  }
}
