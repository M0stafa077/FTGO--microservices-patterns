import {
  MILLISECONDS_PER_SECOND,
  SECONDS_PER_DAY,
  SECONDS_PER_MINUTE,
} from '../common.constants.js';
import { InvalidInput } from '../errors/invalid-input.js';

export class Duration {
  private constructor(private readonly milliseconds: number) {}

  public static ofSeconds(seconds: number): Duration {
    return Duration.ofMilliseconds(seconds * MILLISECONDS_PER_SECOND);
  }

  public static ofMinutes(minutes: number): Duration {
    return Duration.ofSeconds(minutes * SECONDS_PER_MINUTE);
  }

  public static ofDays(days: number): Duration {
    return Duration.ofSeconds(days * SECONDS_PER_DAY);
  }

  public static ofMilliseconds(milliseconds: number): Duration {
    if (!Number.isSafeInteger(milliseconds) || milliseconds <= 0) {
      throw new InvalidInput(
        'duration.invalid',
        `A duration must be a positive whole number of milliseconds, got ${String(milliseconds)}.`,
      );
    }
    return new Duration(milliseconds);
  }

  public addTo(instant: Date): Date {
    return new Date(instant.getTime() + this.milliseconds);
  }

  public subtractFrom(instant: Date): Date {
    return new Date(instant.getTime() - this.milliseconds);
  }

  public toSeconds(): number {
    return Math.floor(this.milliseconds / MILLISECONDS_PER_SECOND);
  }

  public toMilliseconds(): number {
    return this.milliseconds;
  }
}
