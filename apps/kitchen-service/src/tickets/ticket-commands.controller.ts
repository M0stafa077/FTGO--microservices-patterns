import { Quantity } from '@ftgo/common';
import {
  BeginCancelTicket,
  BeginReviseTicket,
  CancelCreateTicket,
  ConfirmCancelTicket,
  ConfirmReviseTicket,
  ConfirmCreateTicket,
  CreateTicket,
  UndoBeginCancelTicket,
  UndoBeginReviseTicket,
  type CreateTicketPayload,
  type CreateTicketReplyPayload,
  type TicketCommandPayload,
  type TicketCommandReplyPayload,
  type TicketDetails,
  type TicketRevisionPayload,
} from '@ftgo/contracts';
import { Reply, type IncomingMessage } from '@ftgo/messaging';
import { MessageController, OnCommand } from '@ftgo/messaging/infrastructure';
import { Injectable } from '@nestjs/common';

import { MenuItemId } from '../restaurants/entities/menu-item-id.js';
import { RestaurantId } from '../restaurants/entities/restaurant-id.js';

import { ConsumerId } from './entities/consumer-id.js';
import { MenuItemName } from './entities/menu-item-name.js';
import { RevisedLineItem } from './entities/revised-line-item.js';
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
    const { orderId, consumerId, restaurantId, ticketDetails } = command.payload;
    const ticket = await this.ticketsService.createTicket(
      TicketId.of(orderId),
      ConsumerId.of(consumerId),
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

  @OnCommand(BeginCancelTicket)
  public async beginCancelTicket(
    command: IncomingMessage<TicketCommandPayload>,
  ): Promise<Reply<TicketCommandReplyPayload>> {
    await this.ticketsService.beginCancelTicket(TicketId.of(command.payload.ticketId));
    return Reply.success({});
  }

  @OnCommand(UndoBeginCancelTicket)
  public async undoBeginCancelTicket(
    command: IncomingMessage<TicketCommandPayload>,
  ): Promise<Reply<TicketCommandReplyPayload>> {
    await this.ticketsService.undoBeginCancelTicket(TicketId.of(command.payload.ticketId));
    return Reply.success({});
  }

  @OnCommand(ConfirmCancelTicket)
  public async confirmCancelTicket(
    command: IncomingMessage<TicketCommandPayload>,
  ): Promise<Reply<TicketCommandReplyPayload>> {
    await this.ticketsService.confirmCancelTicket(TicketId.of(command.payload.ticketId));
    return Reply.success({});
  }

  @OnCommand(BeginReviseTicket)
  public async beginReviseTicket(
    command: IncomingMessage<TicketRevisionPayload>,
  ): Promise<Reply<TicketCommandReplyPayload>> {
    const { ticketId, revisedLineItems } = command.payload;
    await this.ticketsService.beginReviseTicket(
      TicketId.of(ticketId),
      this.revisionsOf(revisedLineItems),
    );
    return Reply.success({});
  }

  @OnCommand(UndoBeginReviseTicket)
  public async undoBeginReviseTicket(
    command: IncomingMessage<TicketCommandPayload>,
  ): Promise<Reply<TicketCommandReplyPayload>> {
    await this.ticketsService.undoBeginReviseTicket(TicketId.of(command.payload.ticketId));
    return Reply.success({});
  }

  @OnCommand(ConfirmReviseTicket)
  public async confirmReviseTicket(
    command: IncomingMessage<TicketRevisionPayload>,
  ): Promise<Reply<TicketCommandReplyPayload>> {
    const { ticketId, revisedLineItems } = command.payload;
    await this.ticketsService.confirmReviseTicket(
      TicketId.of(ticketId),
      this.revisionsOf(revisedLineItems),
    );
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

  private revisionsOf(
    revisedLineItems: TicketRevisionPayload['revisedLineItems'],
  ): ReadonlyArray<RevisedLineItem> {
    return revisedLineItems.map(
      (item) => new RevisedLineItem(MenuItemId.of(item.menuItemId), Quantity.of(item.quantity)),
    );
  }
}
