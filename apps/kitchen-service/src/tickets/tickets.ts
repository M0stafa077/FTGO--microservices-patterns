import type { TicketId } from './entities/ticket-id.js';
import type { Ticket } from './entities/ticket.entity.js';

export interface Tickets {
  findById(id: TicketId): Promise<Ticket | undefined>;

  getById(id: TicketId): Promise<Ticket>;

  add(ticket: Ticket): Promise<void>;

  update(ticket: Ticket): Promise<void>;
}
export const Tickets = Symbol('Tickets');
