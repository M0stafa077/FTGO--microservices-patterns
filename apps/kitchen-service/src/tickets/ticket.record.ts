import { InvalidInput, Quantity } from '@ftgo/common';

import type { TicketLineItemsTable } from '../database/tables/ticket-line-items.table.js';
import type { TicketsTable } from '../database/tables/tickets.table.js';
import { MenuItemId } from '../restaurants/entities/menu-item-id.js';
import { RestaurantId } from '../restaurants/entities/restaurant-id.js';

import { MenuItemName } from './entities/menu-item-name.js';
import { TicketId } from './entities/ticket-id.js';
import { TicketLineItem } from './entities/ticket-line-item.js';
import { TicketLineItems } from './entities/ticket-line-items.js';
import type { TicketState } from './entities/ticket-state.js';
import { Ticket } from './entities/ticket.entity.js';
import { TICKET_STATES } from './tickets.constants.js';

export class TicketRecord {
  private constructor(
    private readonly row: TicketsTable,
    private readonly lineItems: ReadonlyArray<TicketLineItemsTable>,
  ) {}

  public static fromRows(
    row: TicketsTable,
    lineItems: ReadonlyArray<TicketLineItemsTable>,
  ): TicketRecord {
    return new TicketRecord(row, lineItems);
  }

  public static from(ticket: Ticket): TicketRecord {
    const ticketId = ticket.id.toString();
    return new TicketRecord(
      {
        id: ticketId,
        restaurantId: ticket.restaurantId.toString(),
        state: ticket.state,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        version: ticket.version,
      },
      ticket.lineItems.items.map((item, position) => ({
        ticketId,
        menuItemId: item.menuItemId.toString(),
        position,
        name: item.name.toString(),
        quantity: item.quantity.value,
      })),
    );
  }

  public toTicket(): Ticket {
    return Ticket.restore({
      id: TicketId.of(this.row.id),
      restaurantId: RestaurantId.of(this.row.restaurantId),
      lineItems: TicketLineItems.of(this.lineItems.map((item) => this.toLineItem(item))),
      state: this.state(),
      createdAt: this.row.createdAt,
      updatedAt: this.row.updatedAt,
      version: this.row.version,
    });
  }

  public ticketRow(): TicketsTable {
    return { ...this.row };
  }

  public lineItemRows(): TicketLineItemsTable[] {
    return this.lineItems.map((item) => ({ ...item }));
  }

  private toLineItem(item: TicketLineItemsTable): TicketLineItem {
    return TicketLineItem.of(
      MenuItemId.of(item.menuItemId),
      MenuItemName.of(item.name),
      Quantity.of(item.quantity),
    );
  }

  private state(): TicketState {
    const state = TICKET_STATES.get(this.row.state);
    if (state === undefined) {
      throw new InvalidInput('ticket.unknown_state', `Unknown ticket state "${this.row.state}".`);
    }
    return state;
  }
}
