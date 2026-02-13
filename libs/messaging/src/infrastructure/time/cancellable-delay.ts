import { setTimeout as sleep } from 'node:timers/promises';

import type { Duration } from '@ftgo/common';

export class CancellableDelay {
  public async wait(duration: Duration, signal: AbortSignal): Promise<void> {
    try {
      await sleep(duration.toMilliseconds(), undefined, { signal });
    } catch (error) {
      if (!signal.aborted) {
        throw error;
      }
    }
  }
}
