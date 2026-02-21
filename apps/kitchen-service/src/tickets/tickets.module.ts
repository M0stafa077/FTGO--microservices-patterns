import { Module } from '@nestjs/common';

import { RestaurantsModule } from '../restaurants/restaurants.module.js';

import { PostgresTickets } from './postgres-tickets.js';
import { TicketCommandsController } from './ticket-commands.controller.js';
import { TicketEvents } from './ticket-events.js';
import { TicketsController } from './tickets.controller.js';
import { Tickets } from './tickets.js';
import { TicketsService } from './tickets.service.js';

@Module({
  imports: [RestaurantsModule],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    TicketCommandsController,
    TicketEvents,
    { provide: Tickets, useClass: PostgresTickets },
  ],
})
export class TicketsModule {}
