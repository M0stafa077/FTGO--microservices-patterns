import type { TicketLineItem as TicketLineItemPayload } from '@ftgo/contracts';

import type { Ticket } from '../entities/ticket.entity.js';

export class TicketResponse {
  public readonly id: string;
  public readonly restaurantId: string;
  public readonly state: string;
  public readonly lineItems: ReadonlyArray<TicketLineItemPayload>;
  public readonly readyBy: string | null;
  public readonly acceptedAt: string | null;

  public constructor(ticket: Ticket) {
    this.id = ticket.id.toString();
    this.restaurantId = ticket.restaurantId.toString();
    this.state = ticket.state;
    this.lineItems = ticket.lineItems.items.map((item) => ({
      menuItemId: item.menuItemId.toString(),
      name: item.name.toString(),
      quantity: item.quantity.value,
    }));
    this.readyBy = ticket.readyBy?.toISOString() ?? null;
    this.acceptedAt = ticket.acceptedAt?.toISOString() ?? null;
  }
}
