import type { Disposition } from './disposition.js';
import type { PartitionControl } from './partition-control.js';

export class Completed implements Disposition {
  public isFinal(): boolean {
    return true;
  }

  public async settle(partition: PartitionControl): Promise<void> {
    await partition.commit();
  }
}
