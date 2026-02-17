import type { PendingReply } from './pending-reply.js';
import type { SagaAction } from './saga-action.js';

export class LocalAction<Data> implements SagaAction<Data> {
  public constructor(private readonly work: (data: Data) => Promise<void>) {}

  public async perform(data: Data): Promise<PendingReply | undefined> {
    await this.work(data);
    return undefined;
  }

  public acceptReply(data: Data): Data {
    return data;
  }
}
