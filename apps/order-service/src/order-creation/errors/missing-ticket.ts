import { RuleViolation } from '@ftgo/common';

export class MissingTicket extends RuleViolation {
  public constructor(orderId: string) {
    super(
      'order_creation.missing_ticket',
      `The Create Order saga of order ${orderId} has no ticket id.`,
    );
  }
}
