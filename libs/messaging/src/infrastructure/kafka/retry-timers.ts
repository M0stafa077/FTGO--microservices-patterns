import type { Duration } from '@ftgo/common';

export class RetryTimers {
  private readonly timers = new Set<NodeJS.Timeout>();

  public schedule(delay: Duration, action: () => void): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      action();
    }, delay.toMilliseconds());
    this.timers.add(timer);
  }

  public cancelAll(): void {
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}
