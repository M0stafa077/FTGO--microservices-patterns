import type { PartitionControl } from './partition-control.js';

export interface Disposition {
  isFinal(): boolean;
  settle(partition: PartitionControl): Promise<void>;
}
