import type { CourierId } from './courier-id.js';

export interface CourierSnapshot {
  readonly id: CourierId;
  readonly isAvailable: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}
