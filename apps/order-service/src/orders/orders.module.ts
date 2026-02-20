import { Module } from '@nestjs/common';

import { OrderCancellation } from '../order-cancellation/order-cancellation.js';
import { OrderCreation } from '../order-creation/order-creation.js';
import { OrderRevision } from '../order-revision/order-revision.js';
import { RestaurantsModule } from '../restaurants/restaurants.module.js';

import { OrderEventMessages } from './order-event-messages.js';
import { OrderEvents } from './order-events.js';
import { OrderSagaStarts } from './order-saga-starts.js';
import { OrderTransitions } from './order-transitions.js';
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
    OrderTransitions,
    OrderCreation,
    OrderCancellation,
    OrderRevision,
    { provide: Orders, useClass: PostgresOrders },
  ],
})
export class OrdersModule {}
