import { RuleViolation } from '@ftgo/common';

export class DeliveryTimeInPast extends RuleViolation {
  public constructor() {
    super('order.delivery_time_in_past', 'The delivery time must be in the future.');
  }
}
