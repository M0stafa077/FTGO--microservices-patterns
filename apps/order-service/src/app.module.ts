import {
  AccessModule,
  ClockModule,
  LoggingModule,
  ProblemDetailsFilter,
} from '@ftgo/common/infrastructure';
import { MessagingModule } from '@ftgo/messaging/infrastructure';
import { SagaModule } from '@ftgo/saga/infrastructure';
import { Module, type DynamicModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { SERVICE_NAME } from './app.constants.js';
import type { AppConfig } from './config/app.config.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { OrderCancellation } from './order-cancellation/order-cancellation.js';
import { OrderCreation } from './order-creation/order-creation.js';
import { OrderRevision } from './order-revision/order-revision.js';
import { OrdersModule } from './orders/orders.module.js';
import { RestaurantsModule } from './restaurants/restaurants.module.js';

@Module({})
export class AppModule {
  public static with(config: AppConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        LoggingModule.with({ level: config.logLevel }),
        ClockModule,
        AccessModule.with(config.access),
        DatabaseModule.with(config.database),
        MessagingModule.with({ serviceName: SERVICE_NAME, config: config.messaging }),
        SagaModule.with({
          serviceName: SERVICE_NAME,
          definitions: [OrderCreation, OrderCancellation, OrderRevision],
        }),
        RestaurantsModule,
        OrdersModule,
        HealthModule,
      ],
      providers: [{ provide: APP_FILTER, useClass: ProblemDetailsFilter }],
    };
  }
}
