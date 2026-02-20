import { ConcurrentModification } from '@ftgo/common';
import { PostgresFailure } from '@ftgo/common/infrastructure';
import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'kysely';

import { KitchenDatabase } from '../database/kitchen-database.js';
import type { TicketLineItemsTable } from '../database/tables/ticket-line-items.table.js';
import type { TicketsTable } from '../database/tables/tickets.table.js';

import type { TicketId } from './entities/ticket-id.js';
import type { Ticket } from './entities/ticket.entity.js';
import { TicketNotFound } from './errors/ticket-not-found.js';
import { TicketRecord } from './ticket.record.js';
import type { Tickets } from './tickets.js';

@Injectable()
export class PostgresTickets implements Tickets {
  public constructor(@Inject(KitchenDatabase) private readonly database: KitchenDatabase) {}

  public async findById(id: TicketId): Promise<Ticket | undefined> {
    return (await this.findRecord(id))?.toTicket();
  }

  public async getById(id: TicketId): Promise<Ticket> {
    const ticket = await this.findById(id);
    if (ticket === undefined) {
      throw new TicketNotFound(id);
    }
    return ticket;
  }

  public async add(ticket: Ticket): Promise<void> {
    const record = TicketRecord.from(ticket);
    try {
      const database = this.database.current();
      await database.insertInto('tickets').values(record.ticketRow()).execute();
      await database.insertInto('ticketLineItems').values(record.lineItemRows()).execute();
    } catch (error) {
      PostgresFailure.of(error).rethrow('add ticket');
    }
  }

  public async update(ticket: Ticket): Promise<void> {
    const record = TicketRecord.from(ticket);
    const row = record.ticketRow();
    if ((await this.updateRow(row)) === 0n) {
      throw new ConcurrentModification('Ticket', row.id);
    }
    await this.updateQuantities(row.id, record.lineItemRows());
  }

  private async findRecord(id: TicketId): Promise<TicketRecord | undefined> {
    try {
      const database = this.database.current();
      const row = await database
        .selectFrom('tickets')
        .selectAll()
        .where('id', '=', id.toString())
        .executeTakeFirst();
      if (row === undefined) {
        return undefined;
      }
      const lineItems = await database
        .selectFrom('ticketLineItems')
        .selectAll()
        .where('ticketId', '=', row.id)
        .orderBy('position')
        .execute();
      return TicketRecord.fromRows(row, lineItems);
    } catch (error) {
      return PostgresFailure.of(error).rethrow('find ticket');
    }
  }

  private async updateRow(row: TicketsTable): Promise<bigint> {
    try {
      const result = await this.database
        .current()
        .updateTable('tickets')
        .set({ state: row.state, updatedAt: row.updatedAt, version: row.version + 1 })
        .where('id', '=', row.id)
        .where('version', '=', row.version)
        .executeTakeFirst();
      return result.numUpdatedRows;
    } catch (error) {
      return PostgresFailure.of(error).rethrow('update ticket');
    }
  }

  private async updateQuantities(
    ticketId: string,
    lineItems: ReadonlyArray<TicketLineItemsTable>,
  ): Promise<void> {
    const menuItemIds = lineItems.map((item) => item.menuItemId);
    const quantities = lineItems.map((item) => item.quantity);
    try {
      await sql`
        update ticket_line_items as item
        set quantity = revised.quantity
        from unnest(${menuItemIds}::text[], ${quantities}::integer[]) as revised(menu_item_id, quantity)
        where item.ticket_id = ${ticketId}
          and item.menu_item_id = revised.menu_item_id
          and item.quantity <> revised.quantity
      `.execute(this.database.current());
    } catch (error) {
      PostgresFailure.of(error).rethrow('update ticket line items');
    }
  }
}
