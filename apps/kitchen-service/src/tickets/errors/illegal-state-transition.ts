import { RuleViolation } from '@ftgo/common';

import type { TicketId } from '../entities/ticket-id.js';
import type { TicketState } from '../entities/ticket-state.js';

export class IllegalStateTransition extends RuleViolation {
  public constructor(id: TicketId, from: TicketState, to: TicketState) {
    super(
      'ticket.illegal_state_transition',
      `Ticket ${id.toString()} cannot move from ${from} to ${to}.`,
    );
  }
}
