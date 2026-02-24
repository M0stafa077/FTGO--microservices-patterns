import { Module, type DynamicModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { Tracing } from '../../tracing/tracing.js';

import { HttpRouteInterceptor } from './http-route.interceptor.js';
import { TracingShutdown } from './tracing-shutdown.js';

@Module({})
export class TracingModule {
  public static with(tracing: Tracing): DynamicModule {
    return {
      module: TracingModule,
      providers: [
        { provide: Tracing, useValue: tracing },
        { provide: APP_INTERCEPTOR, useClass: HttpRouteInterceptor },
        TracingShutdown,
      ],
    };
  }
}
