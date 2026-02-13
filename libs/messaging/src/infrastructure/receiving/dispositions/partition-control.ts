import type { Duration } from '@ftgo/common';

export interface PartitionControl {
  commit(): Promise<void>;
  retryAfter(delay: Duration): void;
}
