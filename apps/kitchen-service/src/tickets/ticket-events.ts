import { TicketAccepted } from '@ftgo/contracts';
import { Outbox, OutgoingMessage } from '@ftgo/messaging';
import { Inject, Injectable } from '@nestjs/common';

import type { TicketAccepted as TicketAcceptedEvent } from './entities/ticket-accepted.js';
import type { Ticket } from './entities/ticket.entity.js';

@Injectable()
export class TicketEvents {
  public constructor(@Inject(Outbox) private readonly outbox: Outbox) {}

  public async appendEventsOf(ticket: Ticket): Promise<void> {
    for (const event of ticket.releaseEvents()) {
      await this.outbox.append(this.messageOf(event));
    }
  }

  private messageOf(event: TicketAcceptedEvent): OutgoingMessage {
    const ticketId = event.ticketId.toString();
    return OutgoingMessage.event(TicketAccepted, ticketId, {
      ticketId,
      readyBy: event.readyBy.toISOString(),
    });
  }
}
