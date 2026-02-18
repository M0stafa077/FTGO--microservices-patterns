import { Quantity } from '@ftgo/common';
import {
  CancelCreateTicket,
  ConfirmCreateTicket,
  CreateTicket,
  type CreateTicketPayload,
  type CreateTicketReplyPayload,
  type TicketCommandPayload,
  type TicketCommandReplyPayload,
  type TicketDetails,
} from '@ftgo/contracts';
import { Reply, type IncomingMessage } from '@ftgo/messaging';
import { MessageController, OnCommand } from '@ftgo/messaging/infrastructure';
import { Injectable } from '@nestjs/common';

import { MenuItemId } from '../restaurants/entities/menu-item-id.js';
import { RestaurantId } from '../restaurants/entities/restaurant-id.js';

import { MenuItemName } from './entities/menu-item-name.js';
import { TicketId } from './entities/ticket-id.js';
import { TicketLineItem } from './entities/ticket-line-item.js';
import { TicketLineItems } from './entities/ticket-line-items.js';
import { TicketsService } from './tickets.service.js';

@MessageController()
@Injectable()
export class TicketCommandsController {
  public constructor(private readonly ticketsService: TicketsService) {}

  @OnCommand(CreateTicket)
  public async createTicket(
    command: IncomingMessage<CreateTicketPayload>,
  ): Promise<Reply<CreateTicketReplyPayload>> {
    const { orderId, restaurantId, ticketDetails } = command.payload;
    const ticket = await this.ticketsService.createTicket(
      TicketId.of(orderId),
      RestaurantId.of(restaurantId),
      this.lineItemsOf(ticketDetails),
    );
    return Reply.success({ ticketId: ticket.id.toString() });
  }

  @OnCommand(ConfirmCreateTicket)
  public async confirmCreateTicket(
    command: IncomingMessage<TicketCommandPayload>,
  ): Promise<Reply<TicketCommandReplyPayload>> {
    await this.ticketsService.confirmCreateTicket(TicketId.of(command.payload.ticketId));
    return Reply.success({});
  }

  @OnCommand(CancelCreateTicket)
  public async cancelCreateTicket(
    command: IncomingMessage<TicketCommandPayload>,
  ): Promise<Reply<TicketCommandReplyPayload>> {
    await this.ticketsService.cancelCreateTicket(TicketId.of(command.payload.ticketId));
    return Reply.success({});
  }

  private lineItemsOf(details: TicketDetails): TicketLineItems {
    return TicketLineItems.of(
      details.lineItems.map((item) =>
        TicketLineItem.of(
          MenuItemId.of(item.menuItemId),
          MenuItemName.of(item.name),
          Quantity.of(item.quantity),
        ),
      ),
    );
  }
}
