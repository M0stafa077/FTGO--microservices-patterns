import type { CourierId } from './courier-id.js';
import type { CourierSnapshot } from './courier-snapshot.js';

export class Courier {
  public readonly id: CourierId;
  public readonly createdAt: Date;
  public readonly version: number;
  private isCurrentlyAvailable: boolean;
  private lastUpdatedAt: Date;

  private constructor(snapshot: CourierSnapshot) {
    this.id = snapshot.id;
    this.isCurrentlyAvailable = snapshot.isAvailable;
    this.createdAt = snapshot.createdAt;
    this.lastUpdatedAt = snapshot.updatedAt;
    this.version = snapshot.version;
  }

  public get isAvailable(): boolean {
    return this.isCurrentlyAvailable;
  }

  public get updatedAt(): Date {
    return this.lastUpdatedAt;
  }

  public static join(id: CourierId, now: Date): Courier {
    return new Courier({ id, isAvailable: false, createdAt: now, updatedAt: now, version: 0 });
  }

  public static restore(snapshot: CourierSnapshot): Courier {
    return new Courier(snapshot);
  }

  public noteAvailable(now: Date): void {
    this.isCurrentlyAvailable = true;
    this.lastUpdatedAt = now;
  }

  public noteUnavailable(now: Date): void {
    this.isCurrentlyAvailable = false;
    this.lastUpdatedAt = now;
  }
}
