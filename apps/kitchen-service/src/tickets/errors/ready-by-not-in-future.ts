import { RuleViolation } from '@ftgo/common';

import type { TicketId } from '../entities/ticket-id.js';

export class ReadyByNotInFuture extends RuleViolation {
  public constructor(id: TicketId, readyBy: Date) {
    super(
      'ticket.ready_by_not_in_future',
      `Ticket ${id.toString()} cannot be ready by ${readyBy.toISOString()}, which is not in the future.`,
    );
  }
}
