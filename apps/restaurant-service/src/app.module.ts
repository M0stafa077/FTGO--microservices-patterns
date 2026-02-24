import {
  AccessModule,
  ClockModule,
  LoggingModule,
  ProblemDetailsFilter,
  TracingModule,
} from '@ftgo/common/infrastructure';
import type { Tracing } from '@ftgo/common/tracing';
import { MessagingModule } from '@ftgo/messaging/infrastructure';
import { Module, type DynamicModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { SERVICE_NAME } from './app.constants.js';
import type { AppConfig } from './config/app.config.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { RestaurantsModule } from './restaurants/restaurants.module.js';

@Module({})
export class AppModule {
  public static with(config: AppConfig, tracing: Tracing): DynamicModule {
    return {
      module: AppModule,
      imports: [
        LoggingModule.with({ level: config.logLevel }),
        TracingModule.with(tracing),
        ClockModule,
        AccessModule.with(config.access),
        DatabaseModule.with(config.database),
        MessagingModule.with({ serviceName: SERVICE_NAME, config: config.messaging }),
        RestaurantsModule,
        HealthModule,
      ],
      providers: [{ provide: APP_FILTER, useClass: ProblemDetailsFilter }],
    };
  }
}
