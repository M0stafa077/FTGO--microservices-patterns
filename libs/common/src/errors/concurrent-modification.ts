import { Conflict } from './conflict.js';

export class ConcurrentModification extends Conflict {
  public constructor(aggregate: string, id: string) {
    super(
      'aggregate.concurrent_modification',
      `${aggregate} ${id} was changed by another request. Reload it and try again.`,
    );
  }
}
