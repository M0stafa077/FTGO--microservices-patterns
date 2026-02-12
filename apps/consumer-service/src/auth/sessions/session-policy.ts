import type { Duration } from '@ftgo/common';

export interface SessionPolicy {
  readonly lifetime: Duration;
}
export const SessionPolicy = Symbol('SessionPolicy');
