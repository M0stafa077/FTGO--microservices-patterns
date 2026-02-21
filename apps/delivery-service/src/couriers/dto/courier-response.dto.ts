import type { Courier } from '../entities/courier.entity.js';

export class CourierResponse {
  public readonly id: string;
  public readonly isAvailable: boolean;

  public constructor(courier: Courier) {
    this.id = courier.id.toString();
    this.isAvailable = courier.isAvailable;
  }
}
