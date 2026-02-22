import {
  AccessModule,
  ClockModule,
  LoggingModule,
  ProblemDetailsFilter,
} from '@ftgo/common/infrastructure';
import { Module, type DynamicModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { CompositionModule } from './composition/composition.module.js';
import type { AppConfig } from './config/app.config.js';
import { HealthModule } from './health/health.module.js';
import { RoutingModule } from './routing/routing.module.js';

@Module({})
export class AppModule {
  public static with(config: AppConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        LoggingModule.with({ level: config.logLevel }),
        ClockModule,
        AccessModule.with(config.access),
        RoutingModule.with(config.services),
        CompositionModule.with(config.services),
        HealthModule,
      ],
      providers: [{ provide: APP_FILTER, useClass: ProblemDetailsFilter }],
    };
  }
}
