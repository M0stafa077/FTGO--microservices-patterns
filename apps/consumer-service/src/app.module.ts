import { ClockModule, LoggingModule, ProblemDetailsFilter } from '@ftgo/common/infrastructure';
import { MessagingModule } from '@ftgo/messaging/infrastructure';
import { Module, type DynamicModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { AUTH_RATE_LIMIT, SERVICE_NAME } from './app.constants.js';
import { AuthModule } from './auth/auth.module.js';
import type { AppConfig } from './config/app.config.js';
import { ConsumersModule } from './consumers/consumers.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';

@Module({})
export class AppModule {
  public static with(config: AppConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        LoggingModule.with({ level: config.logLevel }),
        ClockModule,
        ThrottlerModule.forRoot([AUTH_RATE_LIMIT]),
        DatabaseModule.with(config.database),
        MessagingModule.with({ serviceName: SERVICE_NAME, config: config.messaging }),
        ConsumersModule,
        AuthModule.with(config.tokens),
        HealthModule,
      ],
      providers: [{ provide: APP_FILTER, useClass: ProblemDetailsFilter }],
    };
  }
}
