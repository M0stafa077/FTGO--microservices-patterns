import type { Clock } from '../../time/clock.js';

export class SystemClock implements Clock {
  public now(): Date {
    return new Date();
  }
}
