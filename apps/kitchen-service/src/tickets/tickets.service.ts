import { Clock, Transactions } from '@ftgo/common';
import { Inject, Injectable } from '@nestjs/common';

import type { RestaurantId } from '../restaurants/entities/restaurant-id.js';
import { Restaurants } from '../restaurants/restaurants.js';

import type { RevisedLineItem } from './entities/revised-line-item.js';
import type { TicketId } from './entities/ticket-id.js';
import type { TicketLineItems } from './entities/ticket-line-items.js';
import { Ticket } from './entities/ticket.entity.js';
import { UnknownRestaurant } from './errors/unknown-restaurant.js';
import { Tickets } from './tickets.js';

@Injectable()
export class TicketsService {
  public constructor(
    @Inject(Tickets) private readonly tickets: Tickets,
    @Inject(Restaurants) private readonly restaurants: Restaurants,
    @Inject(Transactions) private readonly transactions: Transactions,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  public async createTicket(
    id: TicketId,
    restaurantId: RestaurantId,
    lineItems: TicketLineItems,
  ): Promise<Ticket> {
    return this.transactions.run(async () => {
      const existing = await this.tickets.findById(id);
      if (existing !== undefined) {
        return existing;
      }
      const restaurant = await this.restaurants.findById(restaurantId);
      if (restaurant === undefined) {
        throw new UnknownRestaurant(restaurantId);
      }
      const ticket = Ticket.create(id, restaurant, lineItems, this.clock.now());
      await this.tickets.add(ticket);
      return ticket;
    });
  }

  public async confirmCreateTicket(id: TicketId): Promise<void> {
    await this.change(id, (ticket, now) => {
      ticket.confirmCreate(now);
    });
  }

  public async cancelCreateTicket(id: TicketId): Promise<void> {
    await this.change(id, (ticket, now) => {
      ticket.cancelCreate(now);
    });
  }

  public async beginCancelTicket(id: TicketId): Promise<void> {
    await this.change(id, (ticket, now) => {
      ticket.beginCancel(now);
    });
  }

  public async undoBeginCancelTicket(id: TicketId): Promise<void> {
    await this.change(id, (ticket, now) => {
      ticket.undoBeginCancel(now);
    });
  }

  public async confirmCancelTicket(id: TicketId): Promise<void> {
    await this.change(id, (ticket, now) => {
      ticket.confirmCancel(now);
    });
  }

  public async beginReviseTicket(
    id: TicketId,
    revisions: ReadonlyArray<RevisedLineItem>,
  ): Promise<void> {
    await this.change(id, (ticket, now) => {
      ticket.beginRevise(revisions, now);
    });
  }

  public async undoBeginReviseTicket(id: TicketId): Promise<void> {
    await this.change(id, (ticket, now) => {
      ticket.undoBeginRevise(now);
    });
  }

  public async confirmReviseTicket(
    id: TicketId,
    revisions: ReadonlyArray<RevisedLineItem>,
  ): Promise<void> {
    await this.change(id, (ticket, now) => {
      ticket.confirmRevise(revisions, now);
    });
  }

  private async change(
    id: TicketId,
    operation: (ticket: Ticket, now: Date) => void,
  ): Promise<void> {
    await this.transactions.run(async () => {
      const ticket = await this.tickets.getById(id);
      operation(ticket, this.clock.now());
      await this.tickets.update(ticket);
    });
  }
}
