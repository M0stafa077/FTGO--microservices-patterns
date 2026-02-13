import type { Duration } from '@ftgo/common';

export interface OutboxSettings {
  readonly pollInterval: Duration;
  readonly batchSize: number;
  readonly retention: Duration;
}
