import type { Duration } from '@ftgo/common';

export interface HandlerSettings {
  readonly maxAttempts: number;
  readonly maxBackoff: Duration;
  readonly processedMessagesRetention: Duration;
}
