import type { Delivery } from './delivery.js';

export class DeliveryAttempts {
  private readonly attempts = new Map<string, number>();

  public next(delivery: Delivery): number {
    const attempt = (this.attempts.get(delivery.positionId) ?? 0) + 1;
    this.attempts.set(delivery.positionId, attempt);
    return attempt;
  }

  public forget(delivery: Delivery): void {
    this.attempts.delete(delivery.positionId);
  }
}
