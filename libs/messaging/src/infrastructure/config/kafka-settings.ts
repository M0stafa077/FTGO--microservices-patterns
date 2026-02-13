import type { Duration } from '@ftgo/common';

export interface KafkaSettings {
  readonly brokers: ReadonlyArray<string>;
  readonly clientId: string | undefined;
  readonly connectionTimeout: Duration;
}
