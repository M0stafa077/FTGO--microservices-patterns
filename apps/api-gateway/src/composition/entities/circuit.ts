import { CIRCUIT_FAILURE_THRESHOLD, CIRCUIT_OPEN_DURATION } from '../composition.constants.js';

export class Circuit {
  private constructor(
    private failures: number,
    private openUntil: Date | undefined,
  ) {}

  public static closed(): Circuit {
    return new Circuit(0, undefined);
  }

  public isOpen(now: Date): boolean {
    return this.openUntil !== undefined && now.getTime() < this.openUntil.getTime();
  }

  public recordSuccess(): void {
    this.failures = 0;
    this.openUntil = undefined;
  }

  public recordFailure(now: Date): void {
    this.failures += 1;
    if (this.failures >= CIRCUIT_FAILURE_THRESHOLD) {
      this.openUntil = CIRCUIT_OPEN_DURATION.addTo(now);
    }
  }
}
