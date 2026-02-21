import { Module } from '@nestjs/common';

import { RestaurantsModule } from '../restaurants/restaurants.module.js';

import { CourierAssignments } from './courier-assignments.js';
import { DeliveriesController } from './deliveries.controller.js';
import { Deliveries } from './deliveries.js';
import { DeliveriesService } from './deliveries.service.js';
import { OrderEventsController } from './order-events.controller.js';
import { PostgresCourierAssignments } from './postgres-courier-assignments.js';
import { PostgresDeliveries } from './postgres-deliveries.js';
import { TicketEventsController } from './ticket-events.controller.js';

@Module({
  imports: [RestaurantsModule],
  controllers: [DeliveriesController],
  providers: [
    DeliveriesService,
    OrderEventsController,
    TicketEventsController,
    { provide: Deliveries, useClass: PostgresDeliveries },
    { provide: CourierAssignments, useClass: PostgresCourierAssignments },
  ],
})
export class DeliveriesModule {}
