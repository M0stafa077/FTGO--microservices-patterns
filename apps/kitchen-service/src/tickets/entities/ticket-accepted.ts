import type { TicketId } from './ticket-id.js';

export class TicketAccepted {
  public constructor(
    public readonly ticketId: TicketId,
    public readonly readyBy: Date,
  ) {}
}
