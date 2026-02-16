import { Module } from '@nestjs/common';

import { RestaurantsModule } from '../restaurants/restaurants.module.js';

import { OrderEventMessages } from './order-event-messages.js';
import { OrderEvents } from './order-events.js';
import { OrdersController } from './orders.controller.js';
import { Orders } from './orders.js';
import { OrdersService } from './orders.service.js';
import { PostgresOrders } from './postgres-orders.js';

@Module({
  imports: [RestaurantsModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrderEvents,
    OrderEventMessages,
    { provide: Orders, useClass: PostgresOrders },
  ],
})
export class OrdersModule {}
