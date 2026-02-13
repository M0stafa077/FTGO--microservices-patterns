import { randomInt } from 'node:crypto';

import { Duration } from '@ftgo/common';

export class Backoff {
  public constructor(
    private readonly initial: Duration,
    private readonly maximum: Duration,
  ) {}

  public delayFor(attempt: number): Duration {
    const exponential = this.initial.toMilliseconds() * 2 ** Math.max(0, attempt - 1);
    const ceiling = Math.min(this.maximum.toMilliseconds(), exponential);
    return Duration.ofMilliseconds(randomInt(1, ceiling + 1));
  }
}
