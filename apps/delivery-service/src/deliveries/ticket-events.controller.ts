import { TicketAccepted, type TicketAcceptedPayload } from '@ftgo/contracts';
import type { IncomingMessage } from '@ftgo/messaging';
import { MessageController, OnEvent } from '@ftgo/messaging/infrastructure';
import { Injectable } from '@nestjs/common';

import { DeliveriesService } from './deliveries.service.js';
import { DeliveryId } from './entities/delivery-id.js';

@MessageController()
@Injectable()
export class TicketEventsController {
  public constructor(private readonly deliveriesService: DeliveriesService) {}

  @OnEvent(TicketAccepted)
  public async ticketAccepted(event: IncomingMessage<TicketAcceptedPayload>): Promise<void> {
    const { ticketId, readyBy } = event.payload;
    await this.deliveriesService.scheduleDelivery(DeliveryId.of(ticketId), new Date(readyBy));
  }
}
