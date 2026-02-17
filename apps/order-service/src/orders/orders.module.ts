import { Module } from '@nestjs/common';

import { OrderCreation } from '../order-creation/order-creation.js';
import { RestaurantsModule } from '../restaurants/restaurants.module.js';

import { OrderApproval } from './order-approval.js';
import { OrderEventMessages } from './order-event-messages.js';
import { OrderEvents } from './order-events.js';
import { OrderSagaStarts } from './order-saga-starts.js';
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
    OrderSagaStarts,
    OrderApproval,
    OrderCreation,
    { provide: Orders, useClass: PostgresOrders },
  ],
})
export class OrdersModule {}
