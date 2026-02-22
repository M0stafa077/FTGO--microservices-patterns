import { InvalidInput, Quantity } from '@ftgo/common';

import type { TicketLineItemsTable } from '../database/tables/ticket-line-items.table.js';
import type { TicketsTable } from '../database/tables/tickets.table.js';
import { MenuItemId } from '../restaurants/entities/menu-item-id.js';
import { RestaurantId } from '../restaurants/entities/restaurant-id.js';

import { ConsumerId } from './entities/consumer-id.js';
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
        consumerId: ticket.consumerId?.toString() ?? null,
        state: ticket.state,
        previousState: ticket.previousState ?? null,
        readyBy: ticket.readyBy ?? null,
        acceptedAt: ticket.acceptedAt ?? null,
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
      consumerId: this.row.consumerId === null ? undefined : ConsumerId.of(this.row.consumerId),
      lineItems: TicketLineItems.of(this.lineItems.map((item) => this.toLineItem(item))),
      state: this.stateOf(this.row.state),
      previousState:
        this.row.previousState === null ? undefined : this.stateOf(this.row.previousState),
      readyBy: this.row.readyBy ?? undefined,
      acceptedAt: this.row.acceptedAt ?? undefined,
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

  private stateOf(value: string): TicketState {
    const state = TICKET_STATES.get(value);
    if (state === undefined) {
      throw new InvalidInput('ticket.unknown_state', `Unknown ticket state "${value}".`);
    }
    return state;
  }
}
