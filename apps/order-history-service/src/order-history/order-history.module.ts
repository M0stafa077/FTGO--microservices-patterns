import { Module } from '@nestjs/common';

import { OrderEventsController } from './order-events.controller.js';
import { OrderHistoryController } from './order-history.controller.js';
import { OrderHistory } from './order-history.js';
import { OrderHistoryService } from './order-history.service.js';
import { PostgresOrderHistory } from './postgres-order-history.js';

@Module({
  controllers: [OrderHistoryController],
  providers: [
    OrderHistoryService,
    OrderEventsController,
    { provide: OrderHistory, useClass: PostgresOrderHistory },
  ],
})
export class OrderHistoryModule {}
