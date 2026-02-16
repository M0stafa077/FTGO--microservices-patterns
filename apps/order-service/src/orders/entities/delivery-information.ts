import type { Address } from '@ftgo/common';

export class DeliveryInformation {
  private constructor(
    public readonly address: Address,
    public readonly time: Date,
  ) {}

  public static of(address: Address, time: Date): DeliveryInformation {
    return new DeliveryInformation(address, time);
  }

  public isLaterThan(moment: Date): boolean {
    return this.time.getTime() > moment.getTime();
  }
}
