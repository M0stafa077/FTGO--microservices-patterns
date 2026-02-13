import type { Duration } from '@ftgo/common';

import type { Disposition } from './disposition.js';
import type { PartitionControl } from './partition-control.js';

export class RetryLater implements Disposition {
  public constructor(private readonly delay: Duration) {}

  public isFinal(): boolean {
    return false;
  }

  public async settle(partition: PartitionControl): Promise<void> {
    partition.retryAfter(this.delay);
  }
}
