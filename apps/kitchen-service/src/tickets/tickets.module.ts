import { Module } from '@nestjs/common';

import { RestaurantsModule } from '../restaurants/restaurants.module.js';

import { PostgresTickets } from './postgres-tickets.js';
import { TicketCommandsController } from './ticket-commands.controller.js';
import { Tickets } from './tickets.js';
import { TicketsService } from './tickets.service.js';

@Module({
  imports: [RestaurantsModule],
  providers: [
    TicketsService,
    TicketCommandsController,
    { provide: Tickets, useClass: PostgresTickets },
  ],
})
export class TicketsModule {}
