import { ResourceNotFound } from '@ftgo/common';

import type { TicketId } from '../entities/ticket-id.js';

export class TicketNotFound extends ResourceNotFound {
  public constructor(id: TicketId) {
    super('ticket.not_found', `Ticket ${id.toString()} does not exist.`);
  }
}
